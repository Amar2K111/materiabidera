import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";
import { z } from "zod";
import {
  AiError,
  type AiFile,
  type AiProvider,
  type AiResult,
  type GenerateObjectInput,
  type GenerateTextInput,
  validateStructured,
} from "./types";

const DEFAULT_MODEL = "gemini-2.5-pro";

/**
 * Gemini n'accepte qu'un sous-ensemble d'OpenAPI 3.0 pour responseSchema :
 * ces cles JSON Schema n'y ont pas d'equivalent et sont retirees.
 */
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (node && typeof node === "object") {
    // Zod decrit un champ nullable par anyOf [type, null] ; Gemini attend
    // le type seul accompagne de "nullable".
    const anyOf = (node as { anyOf?: unknown[] }).anyOf;
    if (Array.isArray(anyOf)) {
      const nonNull = anyOf.filter(
        (s) => !(s && typeof s === "object" && (s as { type?: string }).type === "null"),
      );
      if (nonNull.length === 1 && nonNull.length < anyOf.length) {
        const { anyOf: _drop, ...rest } = node as Record<string, unknown>;
        void _drop;
        return toGeminiSchema({ ...rest, ...(nonNull[0] as object), nullable: true });
      }
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (
        key === "$schema" ||
        key === "additionalProperties" ||
        key === "exclusiveMinimum" ||
        key === "exclusiveMaximum"
      ) {
        continue;
      }
      out[key] = toGeminiSchema(value);
    }
    return out;
  }
  return node;
}

export function createGeminiProvider(
  apiKey: string,
  model = process.env.AI_MODEL || DEFAULT_MODEL,
): AiProvider {
  const genAI = new GoogleGenerativeAI(apiKey);

  async function call(
    input: GenerateTextInput,
    responseSchema?: ResponseSchema,
    file?: AiFile,
  ) {
    try {
      const generativeModel = genAI.getGenerativeModel({
        model,
        systemInstruction: input.system,
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens ?? 16000,
          ...(responseSchema
            ? { responseMimeType: "application/json", responseSchema }
            : {}),
        },
      });

      const response = await generativeModel.generateContent(
        file
          ? [
              {
                inlineData: {
                  data: Buffer.from(file.data).toString("base64"),
                  mimeType: file.mimeType,
                },
              },
              { text: input.prompt },
            ]
          : input.prompt,
      );
      const usage = response.response.usageMetadata;

      return {
        text: response.response.text(),
        usage: {
          inputTokens: usage?.promptTokenCount ?? null,
          outputTokens: usage?.candidatesTokenCount ?? null,
        },
      };
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      const message = raw.toLowerCase();
      // Le message d'origine est conserve pour le journal des operations ;
      // l'utilisateur ne voit que le libelle associe au type d'erreur.
      // Attention : toutes les erreurs du SDK citent "generateContent", qui
      // contient "rate" : on teste le code HTTP et des termes precis.
      if (
        /\[429|resource_exhausted|quota|rate limit|too many requests/.test(message)
      ) {
        throw new AiError(`Quota atteint : ${raw}`, "rate_limited");
      }
      if (/api key|api_key_invalid|permission_denied|\[403/.test(message)) {
        throw new AiError(`Clé d'API refusée : ${raw}`, "not_configured");
      }
      if (/safety|blocked|recitation/.test(message)) {
        throw new AiError(`Contenu refusé par le modèle : ${raw}`, "refused");
      }
      throw new AiError(`Service indisponible : ${raw}`, "unavailable");
    }
  }

  return {
    id: "gemini",
    model,

    async generateText(input): Promise<AiResult<string>> {
      const { text, usage } = await call(input);
      return { value: text, usage };
    },

    async generateObject<T>(
      input: GenerateObjectInput<T>,
    ): Promise<AiResult<T>> {
      return generateStructured(input);
    },

    async generateObjectFromFile<T>(
      input: GenerateObjectInput<T> & { file: AiFile },
    ): Promise<AiResult<T>> {
      return generateStructured(input, input.file);
    },
  };

  async function generateStructured<T>(
    input: GenerateObjectInput<T>,
    file?: AiFile,
  ): Promise<AiResult<T>> {
      // Le schema est impose au modele via responseSchema, puis la sortie
      // est revalidee : rien n'est enregistre sans avoir ete verifie.
      const responseSchema = toGeminiSchema(
        z.toJSONSchema(input.schema, { target: "draft-2020-12" }),
      ) as unknown as ResponseSchema;
      const { text, usage } = await call(input, responseSchema, file);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new AiError("Réponse non exploitable.", "invalid_output");
      }

      return { value: validateStructured(input.schema, parsed), usage };
  }
}

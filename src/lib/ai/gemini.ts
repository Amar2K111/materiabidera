import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";
import { z } from "zod";
import {
  AiError,
  type AiProvider,
  type AiResult,
  type GenerateObjectInput,
  type GenerateTextInput,
} from "./types";

const DEFAULT_MODEL = "gemini-2.5-pro";

/**
 * Gemini n'accepte qu'un sous-ensemble d'OpenAPI 3.0 pour responseSchema :
 * ces cles JSON Schema n'y ont pas d'equivalent et sont retirees.
 */
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (node && typeof node === "object") {
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

      const response = await generativeModel.generateContent(input.prompt);
      const usage = response.response.usageMetadata;

      return {
        text: response.response.text(),
        usage: {
          inputTokens: usage?.promptTokenCount ?? null,
          outputTokens: usage?.candidatesTokenCount ?? null,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("quota") || message.includes("rate")) {
        throw new AiError("Quota atteint.", "rate_limited");
      }
      if (message.includes("api key") || message.includes("permission")) {
        throw new AiError("Cle d'API refusee.", "not_configured");
      }
      if (message.includes("safety") || message.includes("blocked")) {
        throw new AiError("Contenu refuse par le modele.", "refused");
      }
      throw new AiError("Service indisponible.", "unavailable");
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
      // Le schema est impose au modele via responseSchema, puis la sortie
      // est revalidee : rien n'est enregistre sans avoir ete verifie.
      const responseSchema = toGeminiSchema(
        z.toJSONSchema(input.schema, { target: "draft-2020-12" }),
      ) as unknown as ResponseSchema;
      const { text, usage } = await call(input, responseSchema);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new AiError("Reponse non exploitable.", "invalid_output");
      }

      const result = input.schema.safeParse(parsed);
      if (!result.success) {
        throw new AiError("Reponse hors format attendu.", "invalid_output");
      }

      return { value: result.data, usage };
    },
  };
}

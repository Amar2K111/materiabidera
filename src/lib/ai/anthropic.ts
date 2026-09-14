import Anthropic from "@anthropic-ai/sdk";
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

const DEFAULT_MODEL = "claude-opus-5";

export function createAnthropicProvider(
  apiKey: string,
  model = process.env.AI_MODEL || DEFAULT_MODEL,
): AiProvider {
  const client = new Anthropic({ apiKey });

  async function call(
    input: GenerateTextInput,
    jsonSchema?: Record<string, unknown>,
    file?: AiFile,
  ) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: input.maxOutputTokens ?? 16000,
        system: input.system,
        messages: [
          {
            role: "user",
            content: file
              ? [
                  {
                    type: "document" as const,
                    source: {
                      type: "base64" as const,
                      media_type: file.mimeType,
                      data: Buffer.from(file.data).toString("base64"),
                    },
                  },
                  { type: "text" as const, text: input.prompt },
                ]
              : input.prompt,
          },
        ],
        ...(jsonSchema
          ? {
              output_config: {
                format: { type: "json_schema" as const, schema: jsonSchema },
              },
            }
          : {}),
      });

      if (response.stop_reason === "refusal") {
        throw new AiError("Le modèle a décliné la demande.", "refused");
      }

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      return {
        text,
        usage: {
          inputTokens: response.usage.input_tokens ?? null,
          outputTokens: response.usage.output_tokens ?? null,
        },
      };
    } catch (error) {
      if (error instanceof AiError) throw error;
      if (error instanceof Anthropic.RateLimitError) {
        throw new AiError("Quota atteint.", "rate_limited");
      }
      if (error instanceof Anthropic.AuthenticationError) {
        throw new AiError("Clé d'API refusée.", "not_configured");
      }
      throw new AiError("Service indisponible.", "unavailable");
    }
  }

  return {
    id: "anthropic",
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
      // Le schema est impose au modele, puis la sortie est revalidee :
      // rien n'est enregistre sans avoir ete verifie (section 33).
      const jsonSchema = z.toJSONSchema(input.schema, {
        target: "draft-2020-12",
      }) as Record<string, unknown>;

      const { text, usage } = await call(input, jsonSchema, file);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new AiError("Réponse non exploitable.", "invalid_output");
      }

      return { value: validateStructured(input.schema, parsed), usage };
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  AiError,
  type AiProvider,
  type AiResult,
  type GenerateObjectInput,
  type GenerateTextInput,
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
  ) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: input.maxOutputTokens ?? 16000,
        system: input.system,
        messages: [{ role: "user", content: input.prompt }],
        ...(jsonSchema
          ? {
              output_config: {
                format: { type: "json_schema" as const, schema: jsonSchema },
              },
            }
          : {}),
      });

      if (response.stop_reason === "refusal") {
        throw new AiError("Le modele a decline la demande.", "refused");
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
        throw new AiError("Cle d'API refusee.", "not_configured");
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
      // Le schema est impose au modele, puis la sortie est revalidee :
      // rien n'est enregistre sans avoir ete verifie (section 33).
      const jsonSchema = z.toJSONSchema(input.schema, {
        target: "draft-2020-12",
      }) as Record<string, unknown>;

      const { text, usage } = await call(input, jsonSchema);

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

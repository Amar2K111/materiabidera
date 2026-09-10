import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AiError,
  type AiProvider,
  type AiResult,
  type GenerateObjectInput,
  type GenerateTextInput,
} from "./types";

const DEFAULT_MODEL = "gemini-2.5-pro";

export function createGeminiProvider(
  apiKey: string,
  model = process.env.AI_MODEL || DEFAULT_MODEL,
): AiProvider {
  const genAI = new GoogleGenerativeAI(apiKey);

  async function call(input: GenerateTextInput, json: boolean) {
    try {
      const generativeModel = genAI.getGenerativeModel({
        model,
        systemInstruction: input.system,
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens ?? 16000,
          ...(json ? { responseMimeType: "application/json" } : {}),
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
      const { text, usage } = await call(input, false);
      return { value: text, usage };
    },

    async generateObject<T>(
      input: GenerateObjectInput<T>,
    ): Promise<AiResult<T>> {
      // Le mode JSON garantit un document bien forme, jamais sa conformite
      // metier : la validation par schema reste indispensable.
      const { text, usage } = await call(input, true);

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

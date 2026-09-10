import "server-only";
import { getAiConfig } from "@/lib/env";
import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import { AiError, type AiProvider } from "./types";

export { AiError };
export type { AiProvider };

/**
 * Instancie le fournisseur declare par l'environnement.
 *
 * Aucune cle n'est jamais exposee au client : ce module est marque
 * server-only, toute importation depuis un composant client echoue au build.
 */
export function getAiProvider(): AiProvider {
  const { provider, apiKey, configured } = getAiConfig();

  if (!configured || !apiKey) {
    throw new AiError("Fournisseur IA non configure.", "not_configured");
  }

  switch (provider) {
    case "anthropic":
      return createAnthropicProvider(apiKey);
    case "gemini":
      return createGeminiProvider(apiKey);
    default:
      throw new AiError(
        `Fournisseur inconnu : ${provider}.`,
        "not_configured",
      );
  }
}

export function isAiConfigured(): boolean {
  return getAiConfig().configured;
}

import type { ZodType } from "zod";

/**
 * Couche d'abstraction du fournisseur IA (section 3).
 *
 * L'application ne connait que cette interface : changer de modele ou de
 * fournisseur ne doit jamais impliquer de modifier les services metier.
 */
export interface AiProvider {
  readonly id: string;
  readonly model: string;

  /** Genere une reponse structuree, validee avant d'etre retournee. */
  generateObject<T>(input: GenerateObjectInput<T>): Promise<AiResult<T>>;

  /** Genere du texte libre. */
  generateText(input: GenerateTextInput): Promise<AiResult<string>>;
}

export type GenerateTextInput = {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
};

export type GenerateObjectInput<T> = GenerateTextInput & {
  schema: ZodType<T>;
  /** Nom du format attendu, utile au modele pour se situer. */
  schemaName: string;
};

export type AiResult<T> = {
  value: T;
  usage: { inputTokens: number | null; outputTokens: number | null };
};

/** Erreur destinee a etre convertie en message utilisateur comprehensible. */
export class AiError extends Error {
  constructor(
    message: string,
    readonly kind:
      | "not_configured"
      | "invalid_output"
      | "rate_limited"
      | "unavailable"
      | "refused"
      | "conflict",
    /** Message metier precis, quand le libelle generique ne convient pas. */
    private readonly explicitUserMessage?: string,
  ) {
    super(message);
    this.name = "AiError";
  }

  /** Message affichable tel quel dans l'interface (section 26). */
  get userMessage(): string {
    if (this.explicitUserMessage) return this.explicitUserMessage;

    switch (this.kind) {
      case "conflict":
        return "L'opération entre en conflit avec un travail déjà enregistré.";
      case "not_configured":
        return "Le moteur d'analyse n'est pas configuré. Renseignez une clé dans les paramètres du serveur.";
      case "rate_limited":
        return "Le moteur d'analyse est momentanément saturé. Merci de relancer dans quelques minutes.";
      case "unavailable":
        return "Le moteur d'analyse est indisponible. L'opération n'a pas été effectuée.";
      case "refused":
        return "Le moteur d'analyse n'a pas pu traiter ce contenu.";
      case "invalid_output":
        return "La réponse du moteur d'analyse était inexploitable. Rien n'a été enregistré.";
    }
  }
}

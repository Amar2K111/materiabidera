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
        return "L'operation entre en conflit avec un travail deja enregistre.";
      case "not_configured":
        return "Le moteur d'analyse n'est pas configure. Renseignez une cle dans les parametres du serveur.";
      case "rate_limited":
        return "Le moteur d'analyse est momentanement sature. Merci de relancer dans quelques minutes.";
      case "unavailable":
        return "Le moteur d'analyse est indisponible. L'operation n'a pas ete effectuee.";
      case "refused":
        return "Le moteur d'analyse n'a pas pu traiter ce contenu.";
      case "invalid_output":
        return "La reponse du moteur d'analyse etait inexploitable. Rien n'a ete enregistre.";
    }
  }
}

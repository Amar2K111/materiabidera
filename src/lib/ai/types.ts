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

  /**
   * Genere une reponse structuree a partir d'un fichier joint (PDF scanne).
   * Sert a la reconnaissance du texte lorsque le document n'en contient pas.
   */
  generateObjectFromFile<T>(
    input: GenerateObjectInput<T> & { file: AiFile },
  ): Promise<AiResult<T>>;
}

export type AiFile = {
  data: Uint8Array;
  mimeType: "application/pdf";
};

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

/**
 * Validation d'une sortie structuree.
 *
 * Les modeles ne respectent pas toujours une longueur maximale de texte : un
 * passage trop long est ramene a la limite plutot que de perdre toute la
 * reponse. Toute autre non-conformite (champ manquant, valeur hors liste)
 * reste un echec : rien n'est enregistre sans validation.
 */
export function validateStructured<T>(schema: ZodType<T>, parsed: unknown): T {
  let value = parsed;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = schema.safeParse(value);
    if (result.success) return result.data;

    const issues = result.error.issues;
    const onlyTooLong = issues.every(
      (issue) => issue.code === "too_big" && issue.origin === "string",
    );
    if (attempt === 0 && onlyTooLong) {
      value = structuredClone(value);
      for (const issue of issues) {
        if (issue.code !== "too_big") continue;
        truncateAt(value, issue.path, Number(issue.maximum));
      }
      continue;
    }

    // Le detail (champs en defaut) va au journal des operations uniquement.
    const detail = issues
      .slice(0, 4)
      .map((issue) => `${issue.path.join(".")} : ${issue.message}`)
      .join(" ; ");
    throw new AiError(`Réponse hors format attendu (${detail}).`, "invalid_output");
  }
  throw new AiError("Réponse hors format attendu.", "invalid_output");
}

function truncateAt(root: unknown, path: PropertyKey[], maximum: number) {
  if (path.length === 0 || !Number.isFinite(maximum)) return;
  let node = root as Record<PropertyKey, unknown>;
  for (const key of path.slice(0, -1)) {
    node = node?.[key] as Record<PropertyKey, unknown>;
    if (!node || typeof node !== "object") return;
  }
  const last = path[path.length - 1];
  const text = node[last];
  if (typeof text !== "string") return;
  // Coupe sur un espace pour ne pas laisser un mot tronque.
  const cut = text.slice(0, Math.max(0, maximum - 1));
  const space = cut.lastIndexOf(" ");
  node[last] = `${space > maximum * 0.6 ? cut.slice(0, space) : cut}…`;
}

export type AiErrorKind =
  | "not_configured"
  | "invalid_output"
  | "rate_limited"
  | "unavailable"
  | "refused"
  | "conflict";

/** Erreur destinee a etre convertie en message utilisateur comprehensible. */
export class AiError extends Error {
  readonly kind: AiErrorKind;
  /** Message metier precis, quand le libelle generique ne convient pas. */
  private readonly explicitUserMessage?: string;

  // Proprietes declarees explicitement (pas de "parameter properties") : le
  // module reste lisible par Node sans compilation, pour les tests.
  constructor(message: string, kind: AiErrorKind, explicitUserMessage?: string) {
    super(message);
    this.name = "AiError";
    this.kind = kind;
    this.explicitUserMessage = explicitUserMessage;
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

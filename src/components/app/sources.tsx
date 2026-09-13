import { Building2, ChevronDown, FileText } from "lucide-react";
import { dedupeCited, type CitedSource } from "@/lib/requirements";
import { cn } from "@/lib/utils/cn";

/** Au-dela, la liste est repliee pour ne pas noyer le contenu. */
const INLINE_LIMIT = 3;

/**
 * Nom lisible d'une piece : "01_RC_Reglement_de_consultation.pdf" devient
 * "RC Reglement de consultation". Le nom complet reste disponible au survol.
 */
export function readableDocumentName(name: string): string {
  return name
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/^\d+[\s_.-]+/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Nom court d'une piece du DCE : "CCTP Cahier des clauses techniques" devient
 * "CCTP" lorsque le nom commence par un sigle connu.
 */
export function shortDocumentName(name: string): string {
  const readable = readableDocumentName(name);
  const acronym = readable.match(/^(RC|CCTP|CCAP|CCAG|DPGF|BPU|DQE|AE|ATTRI1|PGC|DIUO)\b/i);
  return acronym ? acronym[1].toUpperCase() : readable;
}

/** Libelles de fiches enregistres avant l'accentuation de l'interface. */
const COMPANY_PREFIXES: Array<[RegExp, string]> = [
  [/^Reference :/, "Référence :"],
  [/^Equipe :/, "Équipe :"],
  [/^Materiel :/, "Matériel :"],
  [/^Methode :/, "Méthode :"],
];

export function readableCompanyLabel(label: string): string {
  for (const [re, to] of COMPANY_PREFIXES) {
    if (re.test(label)) return label.replace(re, to);
  }
  return label;
}

function isCompanySource(source: CitedSource) {
  return source.pageNumber === null && source.label === "base entreprise";
}

export function SourceChip({ source }: { source: CitedSource }) {
  const company = isCompanySource(source);
  const name = company
    ? readableCompanyLabel(source.documentName)
    : shortDocumentName(source.documentName);
  const where = source.pageNumber
    ? `p. ${source.pageNumber}`
    : company
      ? null
      : source.label || null;

  return (
    <span
      className={cn("app-ui__source-chip", company && "is-company")}
      title={company ? `${source.documentName} — base entreprise` : source.documentName}
    >
      {company ? <Building2 aria-hidden /> : <FileText aria-hidden />}
      <span>{name}</span>
      {where ? <em>{where}</em> : null}
    </span>
  );
}

/**
 * Affichage des sources (section 20).
 *
 * Une information sans source est signalee comme telle plutot que presentee
 * comme acquise : c'est ce qui distingue une analyse verifiable d'une
 * affirmation.
 */
export function Sources({
  sources,
  className,
}: {
  sources: CitedSource[];
  className?: string;
}) {
  const unique = dedupeCited(sources);

  if (unique.length === 0) {
    return (
      <p className={cn("mt-2 text-[12px] text-ink-42", className)}>
        Aucune source rattachée. Information à vérifier.
      </p>
    );
  }

  const chips = (
    <ul className="flex flex-wrap gap-1.5">
      {unique.map((s, i) => (
        <li key={`${s.documentName}-${s.pageNumber ?? s.label}-${i}`} className="max-w-full">
          <SourceChip source={s} />
        </li>
      ))}
    </ul>
  );

  if (unique.length <= INLINE_LIMIT) {
    return <div className={cn("mt-2.5", className)}>{chips}</div>;
  }

  return (
    <details className={cn("app-ui__sources", className)}>
      <summary>
        <FileText aria-hidden />
        {unique.length} sources
        <ChevronDown className="app-ui__sources-chevron" aria-hidden />
      </summary>
      <div className="mt-2">{chips}</div>
    </details>
  );
}

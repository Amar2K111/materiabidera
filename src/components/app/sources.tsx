import { FileText } from "lucide-react";
import type { CitedSource } from "@/lib/requirements";

/**
 * Affichage des sources (section 20).
 *
 * Une information sans source est signalee comme telle plutot que presentee
 * comme acquise : c'est ce qui distingue une analyse verifiable d'une
 * affirmation.
 */
export function Sources({ sources }: { sources: CitedSource[] }) {
  if (sources.length === 0) {
    return (
      <p className="mt-2 text-[12px] text-ink-42">
        Aucune source rattachee. Information a verifier.
      </p>
    );
  }

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <li
          key={`${s.documentId}-${s.pageNumber ?? i}`}
          className="inline-flex items-center gap-1.5 rounded-[6px] border border-line bg-paper px-2 py-1 text-[11.5px] font-semibold text-ink-58"
        >
          <FileText className="h-3 w-3 flex-none" strokeWidth={1.8} />
          {s.documentName}
          <span className="text-ink-42">
            {s.pageNumber ? `page ${s.pageNumber}` : s.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

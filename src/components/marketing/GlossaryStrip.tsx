import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const terms = [
  { href: "/blog/cctp-cahier-clauses-techniques", label: "CCTP" },
  { href: "/blog/dpgf-decomposition-prix", label: "DPGF" },
  { href: "/blog/dce-definition-telecharger", label: "DCE" },
  { href: "/blog/dume-guide", label: "DUME" },
  { href: "/blog/ccap-clauses-administratives", label: "CCAP" },
  { href: "/blog/dqe-detail-quantitatif", label: "DQE" },
  { href: "/blog/dc1-lettre-candidature", label: "DC1" },
  { href: "/blog/dc2-declaration-candidat", label: "DC2" },
  { href: "/blog/mapa-procedure-adaptee", label: "MAPA" },
  { href: "/blog/attestation-de-vigilance", label: "Attestation de vigilance" },
];

export function GlossaryStrip() {
  return (
    <div className="border-y border-line bg-white">
      <Container className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-pewter">Les sigles décryptés</p>
        {terms.map((term) => (
          <Link
            key={term.href}
            href={term.href}
            className="text-[14px] font-semibold text-iris transition-colors hover:text-iris-hover"
          >
            {term.label}
          </Link>
        ))}
        <ArrowLink href="/glossaire" className="text-[14px] font-semibold text-steel hover:text-midnight">
          Tout le glossaire
        </ArrowLink>
      </Container>
    </div>
  );
}

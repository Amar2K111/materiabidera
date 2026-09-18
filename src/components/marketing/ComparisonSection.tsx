import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const rows = [
  {
    label: "Vos sources",
    llm: "Plausible, mais invérifiable, à vous de tout relire",
    tc: "Chaque passage relié à un document de votre base",
  },
  {
    label: "Votre savoir-faire",
    llm: "Ne connaît ni vos références, ni vos méthodes",
    tc: "Rédige à partir de vos mémoires, méthodologies et certifications",
  },
  {
    label: "Conformité au DCE",
    llm: "Ignore le règlement de consultation et la pondération",
    tc: "Sommaire construit sur les critères, suivi exigence par exigence",
  },
  {
    label: "Pièges contractuels",
    llm: "Ne sait pas ce qu'il faut chercher dans un CCAP",
    tc: "Dates clés, pénalités et points de vigilance extraits du DCE",
  },
  {
    label: "Confidentialité",
    llm: "Variable selon l'offre et le paramétrage",
    tc: "Hébergement France SecNumCloud, jamais d'entraînement sur vos données",
  },
  {
    label: "Pilotage d'équipe",
    llm: "Un chat individuel, pas un process",
    tc: "Assignation, avancement temps réel, dépôt à l'heure",
  },
];

export function ComparisonSection() {
  return (
    <section className="bg-canvas" id="pourquoi-materiabtp">
      <Container className="py-14 lg:py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">La question qu&apos;on nous pose toujours</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            « Et pourquoi pas ChatGPT ? »
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
            Bonne question. Un LLM généraliste est un brillant stagiaire qui ne connaît ni votre entreprise, ni les marchés. Voici la différence, point par point.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 overflow-hidden rounded border border-line bg-white shadow-soft">
            <div className="hidden bg-snow sm:grid sm:grid-cols-[1fr_1.15fr_1.15fr]">
              <div className="px-6 py-4" />
              <p className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-pewter">LLM généraliste</p>
              <p className="border-l border-iris bg-periwinkle/40 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-iris">
                MateriaBTP
              </p>
            </div>

            {rows.map((row) => (
              <div key={row.label} className="grid border-t border-line sm:grid-cols-[1fr_1.15fr_1.15fr]">
                <p className="px-6 pt-5 text-[15px] font-medium text-midnight sm:py-5">{row.label}</p>
                <div className="flex items-start gap-2.5 px-6 py-3 sm:py-5">
                  <CrossIcon />
                  <p className="text-[14px] leading-relaxed text-pewter">
                    <span className="mr-1 font-semibold text-pewter sm:hidden">LLM généraliste :</span>
                    {row.llm}
                  </p>
                </div>
                <div className="flex items-start gap-2.5 border-l border-iris bg-periwinkle/40 px-6 py-3 pb-5 sm:py-5">
                  <CheckMarkIcon />
                  <p className="text-[14px] font-medium leading-relaxed text-steel">
                    <span className="mr-1 font-semibold text-iris sm:hidden">MateriaBTP :</span>
                    {row.tc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-pretty text-[17px] font-medium text-midnight">
            Pour un email, un LLM suffit. Pour un marché à 2 M€, il y a{" "}
            <Link
              href="/logiciel-reponse-appels-offres"
              className="text-iris underline decoration-iris/30 underline-offset-4 transition-colors hover:decoration-iris"
            >
              l&apos;outil du métier
            </Link>
            .{" "}
            <ArrowLink href="/demo" className="font-semibold text-iris hover:text-iris-hover">
              Jugez sur pièce
            </ArrowLink>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-pewter" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-iris" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

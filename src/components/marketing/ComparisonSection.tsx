import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const rows = [
  {
    label: "Vos sources",
    llm: "Texte plausible, mais sans lien vers la pièce ou la fiche d'origine",
    tc: "Chaque passage cite sa source : page du DCE ou fiche de la base entreprise",
  },
  {
    label: "Votre savoir-faire",
    llm: "Ne connaît ni vos chantiers passés, ni vos méthodes de phasage",
    tc: "S'appuie sur vos références, certifications et fiches méthodes enregistrées",
  },
  {
    label: "Conformité au DCE",
    llm: "Structure libre, sans lien avec les critères pondérés du RC",
    tc: "Sommaire calé sur la pondération, exigences suivies une par une",
  },
  {
    label: "Pièges contractuels",
    llm: "Passe à côté des pénalités, dérogations CCAG et visites obligatoires",
    tc: "Dates, pénalités et points de vigilance relevés dans RC, CCAP et CCTP",
  },
  {
    label: "Confidentialité",
    llm: "Données envoyées à un service tiers, usage flou",
    tc: "Données isolées par entreprise, aucun entraînement sur vos documents",
  },
  {
    label: "Avant le dépôt",
    llm: "Aucune alerte sur les exigences oubliées ou les contradictions",
    tc: "Contrôle qualité : exigences manquantes, sources absentes, incohérences",
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
            Bonne question. Un LLM généraliste rédige vite, mais ne lit pas votre CCAP ni ne connaît vos références chantiers. Voici la différence, point par point.
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
            Pour un mail, un LLM suffit. Pour un marché de travaux à plusieurs centaines de milliers d&apos;euros, il y a{" "}
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

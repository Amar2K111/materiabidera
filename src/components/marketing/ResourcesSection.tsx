import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const resources = [
  {
    href: "/ressources/grille-go-no-go",
    format: "Excel",
    title: "Grille Go/No-Go",
    desc: "17 critères pondérés, score et verdict automatiques : décidez en quelques minutes si un appel d'offres mérite votre réponse.",
    cta: "Télécharger la grille",
    icon: GridIcon,
  },
  {
    href: "/ressources/checklist-candidature",
    format: "Excel",
    title: "Checklist candidature",
    desc: "DC1, DC2, DUME, attestations, dépôt dématérialisé : les 39 points de contrôle d'un dossier complet, avec leurs points de vigilance.",
    cta: "Télécharger la checklist",
    icon: ChecklistIcon,
  },
  {
    href: "/ressources/trame-memoire-technique",
    format: "Word",
    title: "Trame de mémoire technique",
    desc: "10 sections calées sur les critères de l'acheteur, avec un rappel de ce que l'évaluateur note dans chacune.",
    cta: "Télécharger la trame",
    icon: DocIcon,
  },
];

export function ResourcesSection() {
  return (
    <section className="bg-white">
      <Container className="py-12 lg:py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Ressources gratuites</p>
              <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
                Des modèles prêts à l&apos;emploi, sans attendre la démo
              </h2>
            </div>
            <ArrowLink href="/ressources" className="text-[15px] font-semibold text-iris hover:text-iris-hover">
              Toutes les ressources
            </ArrowLink>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <Reveal key={resource.href} delay={index * 90}>
              <Link
                href={resource.href}
                className="lift group flex h-full flex-col rounded border border-line bg-white p-7 shadow-soft hover:border-iris/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded bg-iris text-white">
                    <resource.icon />
                  </span>
                  <span className="rounded bg-snow px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-steel">
                    {resource.format}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-[-0.01em] text-midnight">{resource.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-steel">{resource.desc}</p>
                <span className="arrow-link mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-iris">
                  {resource.cta}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function iconProps() {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-5 w-5",
  };
}

function GridIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M9 3.5v2h6v-2" />
      <path d="m8.7 13 2.2 2.2 4.4-4.6" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4V3.4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4" />
      <path d="m7.8 11 1.4 1.4 2.3-2.6" />
      <path d="M14.5 11.2h2.4" />
      <path d="m7.8 16 1.4 1.4 2.3-2.6" />
      <path d="M14.5 16.2h2.4" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5l-5-5Z" />
      <path d="M14 3.5v5h5" />
      <path d="M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  );
}

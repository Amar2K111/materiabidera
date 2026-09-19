import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";

const agents = [
  {
    title: "Agent d'analyse documentaire",
    desc: "Parcourt RC, CCAP, CCTP et annexes pour en extraire dates, montants, contraintes et pièges contractuels.",
    icon: SearchIcon,
  },
  {
    title: "Agent d'extraction des exigences",
    desc: "Relève chaque exigence à traiter dans le mémoire, avec sa catégorie, sa priorité et sa page source.",
    icon: TargetIcon,
  },
  {
    title: "Agent de structuration",
    desc: "Construit le plan du mémoire technique à partir des critères de jugement et de leur pondération.",
    icon: DatabaseIcon,
  },
  {
    title: "Agent de rédaction",
    desc: "Produit un premier jet par chapitre en s'appuyant uniquement sur votre base entreprise, sources citées.",
    icon: DocIcon,
  },
  {
    title: "Agent de relecture",
    desc: "Compare chaque section au critère visé et signale les passages faibles ou trop génériques.",
    icon: ChartIcon,
  },
  {
    title: "Agent de conformité",
    desc: "Contrôle avant export : exigences non couvertes, affirmations sans source, contradictions entre chapitres.",
    icon: CheckIcon,
  },
];

export function AgentsSection() {
  return (
    <section className="relative overflow-hidden bg-canvas py-12 lg:py-16">
      <div aria-hidden="true" className="stripe-halo pointer-events-none absolute right-[-12%] top-[-24%] h-[40rem] w-[40rem]" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pewter">Agents IA spécialisés</p>
              <h2 className="mt-3 text-balance text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-midnight lg:text-[2.5rem]">
                Chaque étape de la réponse a son spécialiste IA
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-steel">
                De la lecture du DCE au contrôle final, chaque étape du workflow a son module dédié. Vous validez à chaque palier : analyse, Go/No-Go, exigences, mémoire, export.
              </p>
            </div>
          </Reveal>

          <div className="relative">
            <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-px bg-line" />
            <ol className="space-y-9">
              {agents.map((agent, index) => (
                <li key={agent.title}>
                  <Reveal delay={index * 70} className="relative flex gap-5">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-iris text-white shadow-soft">
                      <agent.icon />
                    </span>
                    <div className="pt-1.5">
                      <h3 className="text-[17px] font-semibold text-midnight">{agent.title}</h3>
                      <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-steel">{agent.desc}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}

function iconProps(className = "h-5 w-5") {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function SearchIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg {...iconProps()}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
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

function ChartIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <path d="m8 14 3.5-4 3 2.5L19 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...iconProps()}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const features = [
  {
    title: "Hébergement 100 % en France",
    desc: "Vos données restent sur le territoire, dans des datacenters souverains.",
    icon: ServerIcon,
  },
  {
    title: "Serveurs qualifiés SecNumCloud",
    desc: "Le référentiel de sécurité le plus exigeant de l'ANSSI.",
    icon: ShieldIcon,
  },
  {
    title: "Conforme RGPD, par conception",
    desc: "Vos documents n'entraînent jamais de modèles tiers. Jamais.",
    icon: LockIcon,
  },
];

export function SecuritySection() {
  return (
    <section className="relative overflow-hidden bg-snow py-12 lg:py-16">
      <div aria-hidden="true" className="stripe-halo pointer-events-none absolute bottom-[-40%] left-[-12%] h-[40rem] w-[40rem]" />
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pewter">Sécurité & souveraineté</p>
            <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
              Votre savoir-faire est un actif stratégique. Il est traité comme tel.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-steel">
              Méthodologies, références, prix, organisation : ce que vous confiez à MateriaBTP est ce que vos concurrents aimeraient lire. Notre infrastructure est conçue pour que cela n&apos;arrive jamais.
            </p>
            <p className="mt-7 inline-flex items-center gap-2 rounded border border-line bg-periwinkle/40 px-4 py-2 text-sm font-medium text-midnight">
              <span className="text-base" aria-hidden="true">
                🇫🇷
              </span>
              Conçu, développé et hébergé en France
            </p>
            <p className="mt-6">
              <ArrowLink href="/securite" className="text-[15px] font-semibold text-iris hover:text-iris-hover">
                Notre approche sécurité en détail
              </ArrowLink>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <ul className="space-y-4">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="lift flex items-start gap-4 rounded border border-line bg-white p-5 shadow-soft transition-colors hover:border-iris/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-iris text-white">
                    <feature.icon />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-midnight">{feature.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-steel">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
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

function ServerIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="4" width="16" height="7" rx="2" />
      <rect x="4" y="13" width="16" height="7" rx="2" />
      <path d="M7.5 7.5h.01M7.5 16.5h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.3 4-1.3 7-4.9 7-9.3V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.8-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
    </svg>
  );
}

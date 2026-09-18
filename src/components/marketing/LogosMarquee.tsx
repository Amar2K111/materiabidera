import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";

const audiences = [
  "Gros œuvre",
  "Second œuvre",
  "Travaux publics",
  "Rénovation",
  "Maintenance",
  "Électricité & CVC",
  "Sous-traitance BTP",
  "Marchés publics",
];

function AudienceList({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 items-center gap-4 pr-4 ${ariaHidden ? "marquee-copy" : ""}`}
      aria-hidden={ariaHidden}
    >
      {audiences.map((label) => (
        <li key={`${label}-${ariaHidden ? "copy" : "main"}`}>
          <span className="inline-flex whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium text-steel ring-1 ring-midnight/5">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LogosMarquee() {
  return (
    <section className="bg-snow pb-12 pt-8 lg:pb-16">
      <Container>
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-pewter">
            Pensé pour les équipes qui répondent aux appels d&apos;offres
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-steel">
            MateriaBTP s&apos;adresse aux entreprises du BTP et des travaux qui veulent fiabiliser leurs Go/No-Go et accélérer leurs mémoires techniques.
          </p>
        </Reveal>
      </Container>
      <Reveal delay={100} className="mt-8">
        <div className="marquee">
          <div className="marquee-track">
            <AudienceList />
            <AudienceList ariaHidden />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

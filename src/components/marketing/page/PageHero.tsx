import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      <div aria-hidden="true" className="stripe-halo pointer-events-none absolute right-[-15%] top-[-40%] h-[36rem] w-[36rem]" />
      <Container className="relative py-16 lg:py-24">
        <Reveal>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">{eyebrow}</p>
          ) : null}
          <h1
            className={`max-w-4xl text-balance text-[2.2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-midnight sm:text-5xl lg:text-[3.25rem] ${eyebrow ? "mt-3" : ""}`}
          >
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-steel">{description}</p>
        </Reveal>
      </Container>
    </section>
  );
}

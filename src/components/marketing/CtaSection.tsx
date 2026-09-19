import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-snow py-16 lg:py-24">
      <div aria-hidden="true" className="stripe-halo pointer-events-none absolute right-[-12%] top-[-30%] h-[44rem] w-[44rem]" />
      <Container className="relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-5xl lg:leading-[1.12]">
            Apportez un DCE. Repartez avec votre synthèse.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-steel">
            30 minutes sur votre vrai dossier. Pas de slides, pas d&apos;engagement — juste votre prochain Go/No-Go, fiabilisé.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <ArrowLink
              href="/demo"
              className="rounded bg-iris px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-iris-hover"
            >
              Testez sur un de vos AO
            </ArrowLink>
            <Link
              href="/tarifs"
              className="inline-flex items-center rounded border border-midnight/80 px-6 py-3 text-[15px] font-medium text-midnight transition-colors hover:bg-midnight hover:text-white"
            >
              Voir les offres
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

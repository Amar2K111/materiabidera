import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Container } from "@/components/marketing/ui/Container";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const headlineWords = [
  { text: "Remportez", className: "" },
  { text: "plus", className: "" },
  { text: "d'appels", className: "" },
  { text: "d'offres.", className: "" },
  { text: "Sans", className: "text-steel", i: 5 },
  { text: "y", className: "text-steel", i: 6 },
  { text: "laisser", className: "text-steel", i: 7 },
  { text: "vos", className: "text-steel", i: 8 },
  { text: "semaines.", className: "text-steel", i: 9 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 select-none">
        <Image
          src="/hero/entrepreneur-bureau.jpg"
          alt="Un entrepreneur professionnel travaillant sur son ordinateur dans un bureau moderne"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] lg:object-[right_center]"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas from-25% via-canvas/88 via-60% to-canvas/45 lg:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-canvas from-30% via-canvas/70 via-48% to-transparent to-66% lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />

      <Container className="relative flex min-h-[30rem] flex-col justify-center pb-16 pt-28 lg:min-h-[38rem] lg:pb-24 lg:pt-28">
        <div className="max-w-xl lg:max-w-[34rem]">
          <div className="hero-fade" style={{ "--d": "0ms" } as React.CSSProperties}>
            <ArrowLink
              href="/produit/analyse-go-no-go"
              className="inline-flex items-center gap-2 rounded border border-iris-glow bg-periwinkle/50 py-1.5 pl-2 pr-3.5 text-[13px] font-medium text-midnight transition-colors hover:border-iris/40"
            >
              <span className="rounded bg-iris px-2 py-0.5 text-[11px] font-semibold text-white">Nouveau</span>
              Analyse du DCE et Go/No-Go en quelques minutes
            </ArrowLink>
          </div>

          <h1 className="mt-6 text-balance text-[2.45rem] font-semibold leading-[1.03] tracking-[-0.035em] text-midnight sm:text-5xl lg:text-[3.6rem]">
            {headlineWords.map((word, index) => (
              <Fragment key={word.text}>
                <span className="hw">
                  <span
                    className={`hw-i ${word.className}`}
                    style={{ "--i": word.i ?? index } as React.CSSProperties}
                  >
                    {word.text}
                  </span>
                </span>
                {index < headlineWords.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>

          <p className="hero-fade mt-6 max-w-xl text-pretty text-lg leading-relaxed text-steel" style={{ "--d": "650ms" } as React.CSSProperties}>
            MateriaBTP est le{" "}
            <Link
              href="/logiciel-reponse-appels-offres"
              className="font-medium text-steel underline decoration-line underline-offset-4 transition-colors hover:text-iris hover:decoration-iris/50"
            >
              logiciel de réponse aux appels d&apos;offres
            </Link>{" "}
            qui analyse vos DCE, fiabilise vos Go/No-Go et rédige vos mémoires techniques à partir de votre savoir-faire : l&apos;IA produit, vos experts décident.
          </p>

          <div className="hero-fade mt-7 flex flex-wrap items-center gap-4" style={{ "--d": "820ms" } as React.CSSProperties}>
            <ArrowLink
              href="/demo"
              className="rounded bg-iris px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-iris-hover"
            >
              Testez sur un de vos AO
            </ArrowLink>
            <Link
              href="#comment-ca-marche"
              className="inline-flex items-center rounded border border-midnight/80 px-6 py-3 text-[15px] font-medium text-midnight transition-colors hover:bg-midnight hover:text-white"
            >
              Voir comment ça marche
            </Link>
          </div>

          <div className="hero-fade mt-8" style={{ "--d": "980ms" } as React.CSSProperties}>
            <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white py-2 pl-3.5 pr-4 shadow-soft">
              <span className="rounded-full bg-periwinkle px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-iris">
                100 % BTP
              </span>
              <span className="h-4 w-px bg-line" aria-hidden="true" />
              <span className="text-[12.5px] font-medium text-steel">Programme pilote · Données hébergées en France</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

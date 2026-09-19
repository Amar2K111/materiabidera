import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const btpTrades = [
  { label: "Gros œuvre", tags: ["Qualibat", "ISO 9001"] },
  { label: "Second œuvre", tags: ["MASE", "RGE"] },
  { label: "Travaux publics", tags: ["CCAG Travaux", "TP"] },
  { label: "Rénovation & maintenance", tags: ["ISO 14001", "RSE"] },
  { label: "Électricité & CVC", tags: ["Qualifelec", "CVC"] },
  { label: "Sous-traitance", tags: ["PME", "Accords-cadres"] },
];

export function SectorsSection() {
  return (
    <section className="bg-canvas">
      <Container className="py-12 lg:py-16">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">BTP & Travaux publics</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            100 % pensé pour les entreprises de travaux
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            Pas de grilles RFP génériques : MateriaBTP parle RC, CCAP, CCTP, CCAG Travaux, mémoire technique noté, Qualibat et références de chantiers.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 overflow-hidden rounded border border-line bg-white shadow-soft">
            <ul className="divide-y divide-line">
              {btpTrades.map((trade) => (
                <li key={trade.label}>
                  <Link
                    href="/secteurs/btp-travaux-publics"
                    className="arrow-link group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 px-6 py-5 transition-colors hover:bg-snow sm:grid-cols-[13rem_1fr_auto] lg:px-8"
                  >
                    <h3 className="text-[16px] font-semibold text-midnight">{trade.label}</h3>
                    <span className="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1">
                      {trade.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-snow px-2.5 py-1 text-xs font-medium text-pewter ring-1 ring-line">
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="arrow col-start-2 row-start-1 text-[15px] font-semibold text-iris sm:col-start-auto sm:row-start-auto" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/demo"
                  className="arrow-link group grid items-center gap-x-6 gap-y-1 bg-periwinkle/25 px-6 py-5 transition-colors hover:bg-periwinkle/40 sm:grid-cols-[13rem_1fr_auto] lg:px-8"
                >
                  <h3 className="text-[16px] font-semibold text-midnight">Programme pilote</h3>
                  <p className="text-[15px] leading-relaxed text-steel">
                    Testez MateriaBTP sur l&apos;un de vos vrais appels d&apos;offres BTP — 30 minutes, sans engagement.
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-iris sm:mt-0">
                    Réserver une démo
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={160} className="mt-8">
          <ArrowLink href="/secteurs/btp-travaux-publics" className="text-[15px] font-semibold text-iris hover:text-iris-hover">
            Découvrir MateriaBTP pour le BTP
          </ArrowLink>
        </Reveal>
      </Container>
    </section>
  );
}

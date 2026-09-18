import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const sideArticles = [
  {
    href: "/blog/bordereau-prix-unitaires-bpu",
    date: "3 septembre 2026",
    title: "Le BPU (Bordereau des Prix Unitaires) : rôle, contenu et lien avec le DQE",
    excerpt:
      "Le BPU fixe le prix de chaque prestation à l'unité dans un marché à prix unitaires. Ce qu'il contient, pourquoi c'est la pièce qui engage, et comment il s'articule avec le DQE.",
  },
  {
    href: "/blog/seuils-marches-publics",
    date: "1 septembre 2026",
    title: "Les seuils des marchés publics : quelle procédure selon le montant",
    excerpt:
      "Les seuils déterminent la procédure applicable à un marché public : gré à gré, procédure adaptée (MAPA) ou procédure formalisée. Le tableau des seuils, leur logique et comment les lire pour savoir ce qui vous attend.",
  },
];

export function BlogSection() {
  return (
    <section className="bg-canvas">
      <Container className="py-12 lg:py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Le blog</p>
              <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
                Méthodes et guides pour gagner vos appels d&apos;offres
              </h2>
            </div>
            <ArrowLink href="/blog" className="text-[15px] font-semibold text-iris hover:text-iris-hover">
              Tous les articles
            </ArrowLink>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <article className="lift group flex h-full flex-col overflow-hidden rounded border border-line bg-white shadow-soft hover:border-iris/30 lg:flex-row">
              <Link
                href="/blog/reglement-consultation"
                className="relative block min-h-[15rem] lg:min-h-0 lg:w-1/2"
                tabIndex={-1}
                aria-hidden="true"
              >
                <BlogHeroArt />
              </Link>
              <div className="flex flex-1 flex-col p-6 lg:p-9">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block h-1.5 w-4 rounded-full bg-iris" aria-hidden="true" />
                  <span className="text-pewter">4 min de lecture</span>
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-midnight lg:text-[1.75rem] lg:leading-tight">
                  <Link href="/blog/reglement-consultation" className="hover:text-iris">
                    Le règlement de consultation (RC) : la pièce qui fixe les règles du jeu
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-steel">
                  Le règlement de consultation (RC) fixe les règles de déroulement d&apos;un appel d&apos;offres : contenu du dossier, critères de jugement, modalités et date limite de remise. Comment le lire pour ne pas être écarté sur la forme.
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <time dateTime="2026-09-08" className="text-[13px] text-pewter">
                    8 septembre 2026
                  </time>
                  <ArrowLink href="/blog/reglement-consultation" className="text-[14px] font-semibold text-iris">
                    Lire l&apos;article
                  </ArrowLink>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col divide-y divide-line overflow-hidden rounded border border-line bg-white shadow-soft">
              {sideArticles.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="arrow-link group flex flex-1 flex-col justify-center p-6 transition-colors hover:bg-snow lg:p-7"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block h-1.5 w-4 rounded-full bg-iris" aria-hidden="true" />
                    <time dateTime={article.date} className="text-pewter">
                      {article.date}
                    </time>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-midnight group-hover:text-iris">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-steel">{article.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-iris">
                    Lire l&apos;article
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function BlogHeroArt() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #edeffc 0%, #f8fafd 62%)" }}
    >
      <span
        className="absolute inset-0"
        style={{ background: "radial-gradient(110% 110% at 88% -12%, rgba(83, 58, 253, 0.16), transparent 58%)" }}
      />
      <span
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(6, 27, 49, 0.09) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />
      <span className="absolute -bottom-3 left-[8%] h-3 w-[46%] -rotate-6 bg-iris/[0.08]" />
      <span className="absolute bottom-7 right-[6%] h-2 w-[26%] -rotate-6 bg-iris/[0.10]" />
      <span className="absolute bottom-1 right-[2%] h-1.5 w-[18%] -rotate-6 bg-iris/[0.06]" />
      <span
        className="absolute select-none font-black leading-none"
        style={{
          right: "3%",
          top: "-22%",
          fontSize: "19rem",
          color: "rgba(83, 58, 253, 0.08)",
          WebkitTextStroke: "1px rgba(83, 58, 253, 0.20)",
        }}
      >
        §
      </span>
      <span className="absolute bottom-6 left-7 lg:bottom-8 lg:left-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-steel ring-1 ring-line backdrop-blur-sm">
          Marchés publics
        </span>
      </span>
    </span>
  );
}

import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { PageHero } from "@/components/marketing/page/PageHero";
import { PageCta } from "@/components/marketing/page/PageCta";
import type { ResourcePage } from "@/lib/marketing/content/types";

export function ResourcePageLayout({ page }: { page: ResourcePage }) {
  return (
    <>
      <PageHero
        eyebrow={`Ressource · ${page.format}`}
        title={page.title}
        description={page.description}
      />
      <section className="bg-white">
        <Container className="py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
            <Reveal>
              <p className="text-lg leading-relaxed text-steel">{page.intro}</p>
              <ul className="mt-8 space-y-3">
                {page.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-steel">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <aside className="rounded border border-line bg-snow p-6 shadow-soft">
                <span className="rounded bg-iris px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                  {page.format}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-midnight">Téléchargement gratuit</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-steel">
                  Renseignez votre email pour recevoir le fichier. Aucun engagement.
                </p>
                <form className="mt-5 space-y-3" action="#">
                  <input
                    type="email"
                    required
                    placeholder="Votre email professionnel"
                    className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-midnight outline-none focus:border-iris"
                  />
                  <button
                    type="submit"
                    className="w-full rounded bg-iris px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-iris-hover"
                  >
                    {page.cta}
                  </button>
                </form>
                <p className="mt-4 text-[12px] leading-relaxed text-pewter">
                  En téléchargeant, vous acceptez de recevoir des emails de MateriaBTP. Désinscription à tout moment.
                </p>
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>
      <section className="border-t border-line bg-snow py-8">
        <Container>
          <Link href="/ressources" className="arrow-link text-[15px] font-semibold text-iris hover:text-iris-hover">
            ← Toutes les ressources
          </Link>
        </Container>
      </section>
      <PageCta />
    </>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-iris" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

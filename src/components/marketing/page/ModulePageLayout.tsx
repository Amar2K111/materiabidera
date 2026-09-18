import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { PageHero } from "@/components/marketing/page/PageHero";
import { PageCta } from "@/components/marketing/page/PageCta";
import { PageFaq } from "@/components/marketing/page/PageFaq";
import type { ModulePage } from "@/lib/marketing/content/types";

export function ModulePageLayout({ page }: { page: ModulePage }) {
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />

      <section className="bg-white">
        <Container className="py-12 lg:py-16">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-steel">{page.intro}</p>
          </Reveal>
        </Container>
      </section>

      {page.challenges?.length ? (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-midnight lg:text-3xl">Enjeux</h2>
            </Reveal>
            <Reveal delay={80}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {page.challenges.map((item) => (
                  <li key={item} className="flex gap-3 rounded border border-line bg-white p-4 text-[15px] leading-relaxed text-steel">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </section>
      ) : null}

      {page.benefits?.length ? (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-midnight lg:text-3xl">
                {page.challenges?.length ? "Ce que MateriaBTP apporte" : "Bénéfices"}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {page.benefits.map((item, index) => (
                <Reveal key={item.title} delay={index * 60}>
                  <article className="lift h-full rounded border border-line bg-white p-6 shadow-soft hover:border-iris/30">
                    <h3 className="text-[17px] font-semibold text-midnight">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel">{item.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {page.how?.length ? (
        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-midnight lg:text-3xl">Comment MateriaBTP aide</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {page.how.map((item, index) => (
                <Reveal key={item.title} delay={index * 60}>
                  <article className="lift h-full rounded border border-line bg-snow p-6 hover:border-iris/30">
                    <h3 className="text-[17px] font-semibold text-midnight">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel">{item.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {page.features?.length ? (
        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-midnight lg:text-3xl">Fonctionnalités</h2>
            </Reveal>
            <Reveal delay={80}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {page.features.map((item) => (
                  <li key={item} className="flex gap-3 rounded border border-line bg-snow p-4 text-[15px] leading-relaxed text-steel">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </section>
      ) : null}

      {page.faq?.length ? <PageFaq items={page.faq} /> : null}
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

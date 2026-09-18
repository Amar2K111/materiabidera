import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { PageHero } from "@/components/marketing/page/PageHero";
import { PageCta } from "@/components/marketing/page/PageCta";

type IndexItem = {
  href: string;
  title: string;
  description: string;
  meta?: string;
};

type IndexGridProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items: IndexItem[];
};

export function IndexGrid({ eyebrow, title, description, items }: IndexGridProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="bg-white">
        <Container className="py-12 lg:py-16">
          <div className="overflow-hidden rounded border border-line bg-white shadow-soft">
            <ul className="divide-y divide-line">
              {items.map((item, index) => (
                <Reveal key={item.href} delay={index * 40}>
                  <li>
                    <Link
                      href={item.href}
                      className="arrow-link group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 px-6 py-5 transition-colors hover:bg-snow sm:grid-cols-[14rem_1fr_auto] lg:px-8"
                    >
                      <h2 className="text-[16px] font-semibold text-midnight">{item.title}</h2>
                      <p className="col-span-2 text-[15px] leading-relaxed text-steel sm:col-span-1">{item.description}</p>
                      <span className="col-start-2 row-start-1 flex items-center gap-4 sm:col-start-auto sm:row-start-auto">
                        {item.meta ? (
                          <span className="hidden text-xs font-medium uppercase tracking-[0.08em] text-pewter xl:inline">{item.meta}</span>
                        ) : null}
                        <span className="arrow text-[15px] font-semibold text-iris" aria-hidden="true">
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>
      <PageCta />
    </>
  );
}

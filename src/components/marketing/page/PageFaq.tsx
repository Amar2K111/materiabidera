import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import type { FaqItem } from "@/lib/marketing/content/types";

type PageFaqProps = {
  items: FaqItem[];
};

export function PageFaq({ items }: PageFaqProps) {
  return (
    <section className="bg-snow">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">FAQ</p>
            <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-4xl">
              Questions fréquentes
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-3">
              {items.map((faq) => (
                <details key={faq.q} className="faq-item group rounded border border-line bg-white px-5 transition-colors hover:border-iris/30">
                  <summary className="flex items-center justify-between gap-4 py-4 text-left text-midnight transition-colors hover:text-iris">
                    <h3 className="text-[17px] font-semibold text-inherit">{faq.q}</h3>
                    <span
                      className="faq-chevron flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-snow text-iris ring-1 ring-line"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-5 pr-10 text-[15px] leading-relaxed text-steel">{faq.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

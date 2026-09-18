import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { PageCta } from "@/components/marketing/page/PageCta";
import type { BlogArticle } from "@/lib/marketing/content/types";

export function BlogArticleLayout({ article }: { article: BlogArticle }) {
  return (
    <>
      <section className="border-b border-line bg-canvas">
        <Container className="py-16 lg:py-24">
          <Reveal>
            <Link href="/blog" className="text-[14px] font-semibold text-iris hover:text-iris-hover">
              ← Blog
            </Link>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="inline-block h-1.5 w-4 rounded-full bg-iris" aria-hidden="true" />
              <span className="font-semibold uppercase tracking-[0.12em] text-pewter">{article.category}</span>
              <span className="text-pewter">·</span>
              <span className="text-pewter">{article.readTime}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-balance text-[2.2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-midnight sm:text-5xl">
              {article.title}
            </h1>
            <time dateTime={article.date} className="mt-5 block text-[14px] text-pewter">
              {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </time>
          </Reveal>
        </Container>
      </section>
      <article className="bg-white">
        <Container className="py-12 lg:py-16">
          <Reveal>
            <div className="mx-auto max-w-2xl space-y-5 text-[17px] leading-[1.75] text-steel">
              {article.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </Container>
      </article>
      <PageCta />
    </>
  );
}

import { IndexGrid } from "@/components/marketing/page/IndexGrid";
import { blogArticles, blogSlugs } from "@/lib/marketing/content/blog";
import { pageMetadata } from "@/lib/marketing/content/metadata";

export const metadata = pageMetadata(
  "Blog",
  "Guides, méthodes et retours de terrain pour gagner vos appels d'offres.",
);

export default function BlogIndexPage() {
  const items = blogSlugs
    .map((slug) => blogArticles[slug])
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((article) => ({
      href: `/blog/${article.slug}`,
      title: article.title,
      description: article.excerpt,
      meta: article.category,
    }));

  return (
    <IndexGrid
      eyebrow="Le blog"
      title="Méthodes et guides pour gagner vos appels d'offres"
      description="Marchés publics et mémoires techniques : les pièces d'un appel d'offres et leur vocabulaire, expliqués."
      items={items}
    />
  );
}

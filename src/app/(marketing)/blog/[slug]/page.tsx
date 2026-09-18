import { notFound } from "next/navigation";
import { BlogArticleLayout } from "@/components/marketing/page/BlogArticleLayout";
import { blogArticles, blogSlugs } from "@/lib/marketing/content/blog";
import { pageMetadata } from "@/lib/marketing/content/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = blogArticles[slug];
  if (!article) return {};
  return pageMetadata(article.title, article.description);
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = blogArticles[slug];
  if (!article) notFound();
  return <BlogArticleLayout article={article} />;
}

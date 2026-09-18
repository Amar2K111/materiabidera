import { notFound } from "next/navigation";
import { ModulePageLayout } from "@/components/marketing/page/ModulePageLayout";
import { secteurPages, secteurSlugs } from "@/lib/marketing/content/secteurs";
import { pageMetadata } from "@/lib/marketing/content/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return secteurSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = secteurPages[slug];
  if (!page) return {};
  return pageMetadata(page.title, page.description);
}

export default async function SecteurPage({ params }: PageProps) {
  const { slug } = await params;
  const page = secteurPages[slug];
  if (!page) notFound();
  return <ModulePageLayout page={page} />;
}

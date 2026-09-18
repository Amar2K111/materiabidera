import { notFound } from "next/navigation";
import { ResourcePageLayout } from "@/components/marketing/page/ResourcePageLayout";
import { resourcePages, resourceSlugs } from "@/lib/marketing/content/ressources";
import { pageMetadata } from "@/lib/marketing/content/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return resourceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = resourcePages[slug];
  if (!page) return {};
  return pageMetadata(page.title, page.description);
}

export default async function ResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const page = resourcePages[slug];
  if (!page) notFound();
  return <ResourcePageLayout page={page} />;
}

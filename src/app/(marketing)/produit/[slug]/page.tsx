import { notFound } from "next/navigation";
import { ModulePageLayout } from "@/components/marketing/page/ModulePageLayout";
import { produitPages, produitSlugs } from "@/lib/marketing/content/produit";
import { pageMetadata } from "@/lib/marketing/content/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return produitSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = produitPages[slug];
  if (!page) return {};
  return pageMetadata(page.title, page.description);
}

export default async function ProduitPage({ params }: PageProps) {
  const { slug } = await params;
  const page = produitPages[slug];
  if (!page) notFound();
  return <ModulePageLayout page={page} />;
}

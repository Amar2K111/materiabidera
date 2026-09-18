import { notFound } from "next/navigation";
import { ModulePageLayout } from "@/components/marketing/page/ModulePageLayout";
import { solutionPages, solutionSlugs } from "@/lib/marketing/content/solutions";
import { pageMetadata } from "@/lib/marketing/content/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = solutionPages[slug];
  if (!page) return {};
  return pageMetadata(page.title, page.description);
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const page = solutionPages[slug];
  if (!page) notFound();
  return <ModulePageLayout page={page} />;
}

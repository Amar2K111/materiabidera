import { StaticPageLayout } from "@/components/marketing/page/StaticPageLayout";
import { staticPages } from "@/lib/marketing/content/static-pages";
import { pageMetadata } from "@/lib/marketing/content/metadata";

export function getStaticPage(slug: keyof typeof staticPages) {
  const page = staticPages[slug];
  return {
    metadata: pageMetadata(page.title, page.description),
    render: () => <StaticPageLayout page={page} />,
  };
}

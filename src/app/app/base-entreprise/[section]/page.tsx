import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import { listCollection } from "@/lib/data/company";
import { COLLECTIONS, findCollection } from "@/lib/company";
import { CollectionEditor } from "@/components/app/collection-editor";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ section: c.slug }));
}

export default async function CompanyCollectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const collection = findCollection(section);
  if (!collection) notFound();

  const [ctx, rows] = await Promise.all([
    getAppContext(),
    listCollection(collection),
  ]);

  if (!ctx?.organization) return null;

  return (
    <CollectionEditor
      collection={collection}
      rows={rows}
      organizationId={ctx.organization.id}
    />
  );
}

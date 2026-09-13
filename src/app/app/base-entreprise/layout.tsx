import { COLLECTIONS } from "@/lib/company";
import { PageHeader } from "@/components/ui/page-header";
import { TabNav } from "@/components/app/tab-nav";

const BASE = "/app/base-entreprise";

export default function BaseEntrepriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = [
    { href: BASE, label: "Présentation" },
    ...COLLECTIONS.map((c) => ({
      href: `${BASE}/${c.slug}`,
      label: c.title,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base entreprise"
        subtitle="La mémoire permanente de votre entreprise. Plus elle est complète, plus vos réponses sont adaptées et vérifiables."
      />
      <TabNav items={items} ariaLabel="Sections de la base entreprise" />
      <div className="pt-2">{children}</div>
    </div>
  );
}

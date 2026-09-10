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
    { href: BASE, label: "Presentation" },
    ...COLLECTIONS.map((c) => ({
      href: `${BASE}/${c.slug}`,
      label: c.title,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base entreprise"
        subtitle="La memoire permanente de votre entreprise. Plus elle est complete, plus vos reponses sont adaptees et verifiables."
      />
      <TabNav items={items} ariaLabel="Sections de la base entreprise" />
      <div className="pt-2">{children}</div>
    </div>
  );
}

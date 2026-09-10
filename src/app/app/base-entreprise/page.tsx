import Link from "next/link";
import { getAppContext } from "@/lib/data/context";
import { getCompanyCounts } from "@/lib/data/company";
import { COLLECTIONS } from "@/lib/company";
import { OrganizationForm } from "@/app/app/parametres/organization-form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BaseEntreprisePresentationPage() {
  const [ctx, counts] = await Promise.all([
    getAppContext(),
    getCompanyCounts(),
  ]);

  if (!ctx?.organization) return null;

  return (
    <div className="space-y-6">
      <OrganizationForm organization={ctx.organization} />

      <Card>
        <CardHeader>
          <CardTitle>Etat de votre base</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-2 sm:grid-cols-2">
            {COLLECTIONS.map((c) => {
              const count = counts[c.table] ?? 0;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/app/base-entreprise/${c.slug}`}
                    className="flex items-center justify-between gap-4 rounded-[8px] border border-line px-3 py-2.5 transition-colors hover:border-ink"
                  >
                    <span className="text-[13.5px] font-semibold">
                      {c.title}
                    </span>
                    <span
                      className={
                        count === 0
                          ? "tabular text-[13px] font-bold text-ink-42"
                          : "tabular text-[13px] font-bold"
                      }
                    >
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

import { DemoPageLayout } from "@/components/marketing/page/DemoPageLayout";
import { pageMetadata } from "@/lib/marketing/content/metadata";

export const metadata = pageMetadata(
  "Réserver une démo",
  "Démonstration de 30 minutes sur l'un de vos vrais appels d'offres : analyse de DCE, Go/No-Go et mémoire technique.",
);

export default function DemoPage() {
  return <DemoPageLayout />;
}

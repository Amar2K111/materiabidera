import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import "../marketing.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MateriaBTP : répondre aux appels d'offres BTP, sources à l'appui",
  description:
    "Logiciel de réponse aux appels d'offres BTP : analyse du DCE, Go/No-Go sur pièces, mémoire technique rédigé depuis vos références chantiers — chaque passage sourcé. L'IA prépare, vos équipes tranchent.",
  applicationName: "MateriaBTP",
  keywords: [
    "appel d'offres",
    "reponse appel d'offres",
    "logiciel appel d'offres",
    "memoire technique",
    "Go/No-Go",
    "DCE",
    "marches publics",
    "BTP",
    "travaux publics",
    "memoire technique BTP",
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geist.variable} marketing-site min-h-dvh flex flex-col bg-white font-sans text-body antialiased`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

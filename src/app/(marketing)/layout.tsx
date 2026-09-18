import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Banner } from "@/components/marketing/layout/Banner";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import "../marketing.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MateriaBTP : l'IA qui fait gagner vos appels d'offres BTP",
  description:
    "Le logiciel IA de reponse aux appels d'offres pour le BTP : analysez vos DCE, fiabilisez vos Go/No-Go et redigez vos memoires techniques depuis vos references chantiers.",
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
      <Banner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

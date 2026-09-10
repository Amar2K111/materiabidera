import type { Metadata } from "next";
import Script from "next/script";
import { LandingPage } from "@/components/landing/LandingPage";
import { FAQ_ITEMS } from "@/components/landing/faq-data";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: "MateriaBTP : IA pour les appels d’offres et mémoires techniques BTP",
  description:
    "Analysez vos DCE, identifiez les exigences, structurez vos réponses et générez des mémoires techniques personnalisés avec MateriaBTP, l’IA dédiée aux entreprises du BTP.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MateriaBTP",
    title: "MateriaBTP : IA pour les appels d’offres et mémoires techniques BTP",
    description:
      "Du DCE au mémoire technique exporté : MateriaBTP analyse, structure, personnalise et vérifie votre réponse aux appels d’offres BTP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MateriaBTP : IA pour les appels d’offres et mémoires techniques BTP",
    description:
      "Analyse de DCE, exigences tracées, mémoire technique personnalisé et contrôle de couverture avant dépôt.",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MateriaBTP",
  applicationCategory: "BusinessApplication",
  applicationSubCategory:
    "Logiciel d’appels d’offres et de mémoires techniques BTP",
  operatingSystem: "Web",
  inLanguage: "fr-FR",
  description:
    "MateriaBTP est un logiciel IA pour les entreprises du BTP qui répondent aux appels d’offres. Il analyse les DCE (RC, CCTP, CCAP, DPGF), produit une analyse Go/No-Go, identifie les exigences et leur source, exploite la base de connaissances de l’entreprise, construit une stratégie de réponse, génère un mémoire technique personnalisé, contrôle la couverture des exigences et exporte en Word ou PDF.",
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Entreprises du BTP répondant aux appels d’offres",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "fr-FR",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function HomePage() {
  return (
    <div className="landing">
      <LandingPage />
      <Script
        id="materiabtp-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Script
        id="materiabtp-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}

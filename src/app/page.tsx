import type { Metadata } from "next";
import { PlumtechLanding } from "@/components/landing/plumtech/PlumtechLanding";

export const metadata: Metadata = {
  title: "MateriaBTP",
  description:
    "Plateforme IA d'aide a la reponse aux appels d'offres pour les entreprises du BTP.",
};

export default function HomePage() {
  return <PlumtechLanding />;
}

import type { Metadata } from "next";

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | MateriaBTP`,
    description,
    openGraph: {
      title: `${title} | MateriaBTP`,
      description,
      siteName: "MateriaBTP",
      locale: "fr_FR",
      type: "website",
    },
  };
}

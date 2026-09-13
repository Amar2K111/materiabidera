import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs et mammoth lisent des fichiers a l execution : les laisser hors du
  // bundle serveur pour que leurs chemins internes restent valides.
  serverExternalPackages: ["pdfjs-dist", "mammoth", "@react-pdf/renderer"],

  // Masque le badge « N » Next.js en dev (sinon visible sur la landing et dans les captures).
  devIndicators: false,
};

export default nextConfig;

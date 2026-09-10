import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs et mammoth lisent des fichiers a l execution : les laisser hors du
  // bundle serveur pour que leurs chemins internes restent valides.
  serverExternalPackages: ["pdfjs-dist", "mammoth", "@react-pdf/renderer"],

};

export default nextConfig;

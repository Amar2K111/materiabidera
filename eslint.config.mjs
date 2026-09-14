import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Scripts Node ponctuels (CommonJS) : require() y est normal.
    files: ["scripts/**/*.js", "scripts/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sortie de build Vercel : code genere.
    ".vercel/**",
    ".cursor/**",
    // Landing statique et captures generees : hors du code de l'application.
    "materiabtp-assets/**",
    "public/**",
    "exports/**",
  ]),
]);

export default eslintConfig;

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

const LINKEDIN_URL = "https://www.linkedin.com/company/materiabtp/";

const TAGLINE =
  "Assistant IA pour analyser vos DCE et r\u00e9diger vos m\u00e9moires techniques BTP, avec tra\u00e7abilit\u00e9 et sans contenu invent\u00e9.";
const RIGHTS =
  "Tous droits r\u00e9serv\u00e9s.";
const HOSTING =
  "H\u00e9bergement UE \u00b7 Donn\u00e9es isol\u00e9es par entreprise";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
      <defs>
        <mask id="plumtech-linkedin-mask">
          <rect width="32" height="32" rx="5" fill="white" />
          <path
            fill="black"
            transform="translate(4 4)"
            d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM5 8H0v16h5V8zm7.982 0H8.014v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0V24H24V13.869c0-7.88-8.922-7.593-11.018-3.714V8z"
          />
        </mask>
      </defs>
      <rect
        width="32"
        height="32"
        rx="5"
        fill="currentColor"
        mask="url(#plumtech-linkedin-mask)"
      />
    </svg>
  );
}

export function PlumtechFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-light border-t border-navy-10 bg-surface-plum pt-section-sm font-body text-body-plum">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md space-y-4">
            <Link href="/" aria-label="MateriaBTP accueil">
              <BrandLogo height={32} variant="default" />
            </Link>
            <p className="text-meta/relaxed text-muted-plum">{TAGLINE}</p>
          </div>

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-navy-10 bg-white text-primary transition-colors hover:bg-surface-plum"
            aria-label="LinkedIn MateriaBTP"
          >
            <LinkedInIcon />
          </a>
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-muted-plum">
            {"\u00a9 "}
            {year} MateriaBTP. {RIGHTS}
          </p>
          <p className="text-caption text-muted-plum">{HOSTING}</p>
        </div>
      </div>
    </footer>
  );
}

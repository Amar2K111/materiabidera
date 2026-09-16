import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

const LINKEDIN_URL = "https://www.linkedin.com/company/materiabtp/";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
      <defs>
        <mask id="landing-linkedin-mask">
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
        mask="url(#landing-linkedin-mask)"
      />
    </svg>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid foot-grid--minimal">
          <div>
            <Link
              href="/#top"
              className="brand"
              aria-label="MateriaBTP — retour en haut de page"
            >
              <BrandLogo height={26} variant="on-dark" />
            </Link>
            <p className="foot-tag">
              Assistant IA pour analyser vos DCE et rédiger vos mémoires
              techniques BTP, avec traçabilité et sans contenu inventé.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social"
              aria-label="LinkedIn MateriaBTP"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© {year} MateriaBTP</span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Logo } from "@/components/marketing/ui/Logo";
import { Container } from "@/components/marketing/ui/Container";
import { CONTACT_EMAIL } from "@/lib/marketing/config/contact";

const productLinks = [
  { href: "/logiciel-reponse-appels-offres", label: "Logiciel de réponse aux appels d'offres" },
  { href: "/produit/analyse-go-no-go", label: "Analyse & Go/No-Go" },
  { href: "/produit/memoire-technique", label: "Mémoire technique" },
  { href: "/produit/questionnaires", label: "Questionnaires & DDQ" },
  { href: "/produit/base-de-connaissances", label: "Base de connaissances" },
  { href: "/produit/collaboration", label: "Collaboration & pilotage" },
  { href: "/tarifs", label: "Tarifs" },
];

const solutionLinks = [
  { href: "/secteurs/btp-travaux-publics", label: "BTP & Travaux publics" },
  { href: "/solutions/marches-publics", label: "Marchés publics" },
  { href: "/solutions/rfp-consultations-privees", label: "RFP & consultations privées" },
  { href: "/solutions/questionnaires-rfi-ddq", label: "Questionnaires RFI, DDQ & sécurité" },
  { href: "/calculateur-roi", label: "Calculateur ROI" },
  { href: "/glossaire", label: "Glossaire des appels d'offres" },
  { href: "/blog", label: "Blog" },
];

const companyLinks = [
  { href: "/a-propos", label: "À propos" },
  { href: "/recrutement", label: "Recrutement" },
  { href: "/cas-clients", label: "Cas clients" },
  { href: "/podcast", label: "Podcast" },
  { href: "/ressources", label: "Ressources" },
  { href: "/securite", label: "Sécurité & souveraineté" },
  { href: "/contact", label: "Contact" },
  { href: "/demo", label: "Testez sur un de vos AO" },
  { href: "/login", label: "Connexion" },
  { href: "https://www.linkedin.com/company/materiabtp", label: "LinkedIn", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-steel">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.15fr_1fr]">
          <div>
            <Link aria-label="MateriaBTP : Accueil" href="/">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-pewter">
              L&apos;IA de réponse aux appels d&apos;offres pensée pour le BTP : analyse du DCE, Go/No-Go et mémoires techniques à partir de votre savoir-faire chantier.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded border border-line px-3.5 py-1.5 text-[13px] font-medium text-steel">
              <ShieldIcon />
              Données hébergées en France · SecNumCloud · RGPD
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-pewter">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-midnight">
                {CONTACT_EMAIL}
              </a>
              <a
                href="https://www.linkedin.com/company/materiabtp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MateriaBTP sur LinkedIn"
                className="hover:text-midnight"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          <FooterNav title="Produit" links={productLinks} />
          <FooterNav title="Solutions" links={solutionLinks} />
          <FooterNav title="Entreprise" links={companyLinks} />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-sm text-pewter sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} MateriaBTP, Tous droits réservés · EuraTechnologies, Lille, France
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link className="hover:text-midnight" href="/mentions-legales">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link className="hover:text-midnight" href="/confidentialite">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link className="hover:text-midnight" href="/cgu">
                Conditions d&apos;utilisation
              </Link>
            </li>
            <li>
              <button type="button" className="cursor-pointer transition-colors hover:text-midnight">
                Gérer les cookies
              </button>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold text-midnight">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-pewter transition-colors hover:text-midnight"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[15px] text-pewter transition-colors hover:text-midnight"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 text-iris">
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.3 4-1.3 7-4.9 7-9.3V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.8-4" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

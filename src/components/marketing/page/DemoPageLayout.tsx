import Link from "next/link";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { CalendlyEmbed } from "@/components/marketing/page/CalendlyEmbed";
import { calendlyBookingUrl } from "@/lib/marketing/config/calendly";
import { CONTACT_EMAIL, CONTACT_NAME, CONTACT_ROLE } from "@/lib/marketing/config/contact";

const benefits = [
  {
    title: "30 minutes, en visio",
    description: "Une démonstration ciblée sur votre cas, pas un tour générique du produit.",
  },
  {
    title: "Sur l'un de VOS appels d'offres",
    description: "Apportez un DCE : vous repartez avec sa Fiche Synthèse GoNoGo.",
  },
  {
    title: "Sans engagement",
    description: "Un échange entre experts de la réponse AO. Le devis ne vient qu'après, si pertinent.",
  },
];

const beforeDemoLinks = [
  {
    href: "/produit/analyse-go-no-go",
    label: "Produit",
    title: "Analyse du DCE et Go/No-Go en quelques minutes",
    description: "RC, CCAP, CCTP : dates clés, pénalités et points de vigilance dans une Fiche Synthèse GoNoGo.",
  },
  {
    href: "/securite",
    label: "Sécurité",
    title: "Où vivent vos données",
    description: "Hébergement en France, cloisonnement par client, aucun entraînement de modèle sur vos documents.",
  },
  {
    href: "/logiciel-reponse-appels-offres",
    label: "Logiciel",
    title: "Le logiciel de réponse aux appels d'offres",
    description: "Ce que couvre MateriaBTP, de l'analyse du DCE au dépôt : le tour complet avant d'en parler de vive voix.",
  },
];

export function DemoPageLayout() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const bookingUrl = calendlyBookingUrl(month);

  return (
    <>
      <section className="relative overflow-hidden bg-canvas">
        <div aria-hidden="true" className="stripe-halo pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[64rem] -translate-x-1/2" />
        <Container className="relative pb-20 pt-32 lg:pb-24 lg:pt-40">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Démo</p>
              <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-midnight sm:text-5xl">
                Voyez MateriaBTP à l&apos;œuvre sur l&apos;un de <span className="text-iris-gradient">vos</span> appels d&apos;offres
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-steel">
                La meilleure façon de juger : votre propre DCE, analysé en direct. Concret, chiffré, sans slides.
              </p>

              <ul className="mt-9 space-y-5">
                {benefits.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-periwinkle ring-1 ring-iris-glow">
                      <CheckIcon />
                    </span>
                    <div>
                      <h2 className="text-[16px] font-semibold text-midnight">{item.title}</h2>
                      <p className="mt-0.5 text-[15px] leading-relaxed text-steel">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded border border-line bg-snow p-6">
                <p className="text-sm font-semibold text-midnight">Vous préférez le contact direct ?</p>
                <p className="mt-2 text-[15px] text-steel">
                  {CONTACT_NAME}, {CONTACT_ROLE} ·{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-iris hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </p>
                <p className="mt-4 text-[13px] text-pewter">
                  Programme pilote ouvert — places limitées pour les premières entreprises du BTP.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-pewter">Choisissez votre créneau</p>
              <div className="overflow-hidden rounded border border-line bg-white shadow-soft">
                <CalendlyEmbed />
                <p className="border-t border-line bg-snow px-5 py-3 text-center text-[13px] text-pewter">
                  Le calendrier ne s&apos;affiche pas ?{" "}
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-iris hover:underline"
                  >
                    Réservez directement ici →
                  </a>
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-canvas">
        <Container className="py-12 lg:py-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pewter">Avant votre démo</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {beforeDemoLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="lift group rounded border border-line bg-white p-6 shadow-soft hover:border-iris/30"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-pewter">{item.label}</p>
                  <h3 className="mt-1.5 text-[16px] font-medium text-midnight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{item.description}</p>
                  <span className="arrow-link mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-iris">
                    Découvrir
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 text-iris"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

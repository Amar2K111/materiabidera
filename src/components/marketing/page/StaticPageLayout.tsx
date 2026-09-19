"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";
import { PageHero } from "@/components/marketing/page/PageHero";
import { PageCta } from "@/components/marketing/page/PageCta";
import { glossaryEntries } from "@/lib/marketing/content/glossaire";
import { CONTACT_EMAIL } from "@/lib/marketing/config/contact";
import type { StaticPage, StaticSection } from "@/lib/marketing/content/types";

export function StaticPageLayout({ page }: { page: StaticPage }) {
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />
      {page.sections.map((section, index) => (
        <SectionBlock key={`${section.type}-${index}`} section={section} />
      ))}
      <PageCta />
    </>
  );
}

function SectionBlock({ section }: { section: StaticSection }) {
  switch (section.type) {
    case "prose":
      return (
        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-steel">
              {section.content.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          </Container>
        </section>
      );
    case "cards":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            {section.title ? (
              <h2 className="text-2xl font-semibold tracking-tight text-midnight lg:text-3xl">{section.title}</h2>
            ) : null}
            <div className={`grid gap-5 sm:grid-cols-2 ${section.title ? "mt-10" : ""}`}>
              {section.items.map((item) => (
                <article key={item.title} className="lift rounded border border-line bg-white p-6 shadow-soft hover:border-iris/30">
                  <h3 className="text-[17px] font-semibold text-midnight">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-steel">{item.description}</p>
                  {item.href ? (
                    <ArrowLink href={item.href} className="mt-4 text-[14px] font-semibold text-iris">
                      En savoir plus
                    </ArrowLink>
                  ) : null}
                </article>
              ))}
            </div>
          </Container>
        </section>
      );
    case "pricing":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <div className="grid gap-5 lg:grid-cols-3">
              {section.plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex flex-col rounded border p-7 ${plan.highlighted ? "border-iris bg-white shadow-soft ring-2 ring-iris/20" : "border-line bg-white shadow-soft"}`}
                >
                  <h3 className="text-xl font-semibold text-midnight">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-semibold text-iris">{plan.price}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-steel">{plan.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-[14px] text-steel">
                        <span className="text-iris">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <ArrowLink
                    href="/demo"
                    className={`mt-8 justify-center rounded px-4 py-2.5 text-center text-[15px] font-medium ${plan.highlighted ? "bg-iris text-white hover:bg-iris-hover" : "border border-midnight/80 text-midnight hover:bg-midnight hover:text-white"}`}
                    showArrow={false}
                  >
                    Demander une démo
                  </ArrowLink>
                </article>
              ))}
            </div>
          </Container>
        </section>
      );
    case "form":
      return (
        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <ContactForm variant={section.form} />
          </Container>
        </section>
      );
    case "glossary":
      return (
        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <dl className="mx-auto max-w-3xl divide-y divide-line">
              {glossaryEntries.map((entry) => (
                <div key={entry.term} className="py-6">
                  <dt className="text-lg font-semibold text-midnight">{entry.term}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-steel">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      );
    case "security":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <li key={item.title} className="rounded border border-line bg-white p-5 shadow-soft">
                  <h3 className="text-[16px] font-semibold text-midnight">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-steel">{item.description}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      );
    default:
      return null;
  }
}

/**
 * Formulaire de contact.
 *
 * Le site n'a pas de service d'envoi d'e-mails : le formulaire prepare donc le
 * message dans la messagerie du visiteur, qui l'envoie lui-meme. Auparavant,
 * il affichait « Message envoye » sans rien transmettre, et la demande etait
 * perdue.
 */
function ContactForm({ variant }: { variant: "demo" | "contact" }) {
  const [opened, setOpened] = useState(false);

  if (opened) {
    return (
      <Reveal>
        <div className="mx-auto max-w-lg rounded border border-line bg-snow p-8 text-center">
          <p className="text-lg font-semibold text-midnight">Votre message est prêt dans votre messagerie</p>
          <p className="mt-2 text-[15px] leading-relaxed text-steel">
            Il reste à l&apos;envoyer depuis votre logiciel de messagerie. Si rien ne s&apos;est ouvert,
            écrivez-nous directement à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-iris">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setOpened(false)}
            className="mt-5 text-[14px] font-semibold text-iris hover:underline"
          >
            Revenir au formulaire
          </button>
        </div>
      </Reveal>
    );
  }

  return (
    <form
      className="mx-auto max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const value = (name: string) => String(data.get(name) ?? "").trim();
        const subject =
          variant === "demo"
            ? `Demande de démonstration — ${value("company")}`
            : `Contact MateriaBTP — ${value("company")}`;
        const body = [
          `${value("firstName")} ${value("lastName")}`,
          value("company"),
          value("email"),
          "",
          value("message"),
        ].join("\n");
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setOpened(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" name="firstName" required />
        <Field label="Nom" name="lastName" required />
      </div>
      <Field label="Email professionnel" name="email" type="email" required />
      <Field label="Entreprise" name="company" required />
      {variant === "demo" ? (
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-midnight">
            Décrivez brièvement votre prochain AO (optionnel)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="mt-1.5 w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-midnight outline-none focus:border-iris"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-midnight">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="mt-1.5 w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-midnight outline-none focus:border-iris"
          />
        </div>
      )}
      <button type="submit" className="w-full rounded bg-iris px-4 py-3 text-[15px] font-medium text-white hover:bg-iris-hover">
        {variant === "demo" ? "Préparer ma demande de démo" : "Préparer mon message"}
      </button>
      <p className="text-center text-[12px] text-pewter">
        Le bouton ouvre votre messagerie avec le message prérempli : c&apos;est vous qui l&apos;envoyez.
      </p>
      <p className="text-center text-[12px] text-pewter">
        Ou écrivez-nous directement :{" "}
        <Link href={`mailto:${CONTACT_EMAIL}`} className="text-iris">
          {CONTACT_EMAIL}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-midnight">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-midnight outline-none focus:border-iris"
      />
    </div>
  );
}

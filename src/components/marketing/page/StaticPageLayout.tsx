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
    case "roi-calculator":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <RoiCalculator />
          </Container>
        </section>
      );
    case "case-studies":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <div className="grid gap-6 lg:grid-cols-3">
              {section.items.map((study) => (
                <article key={study.company} className="flex flex-col rounded border border-line bg-white p-7 shadow-soft">
                  <p className="text-4xl font-semibold tracking-tight text-iris">{study.stat}</p>
                  <p className="text-sm font-medium text-pewter">{study.statLabel}</p>
                  <blockquote className="mt-6 flex-1 text-[15px] leading-relaxed text-steel">&ldquo;{study.quote}&rdquo;</blockquote>
                  <footer className="mt-6 border-t border-line pt-4">
                    <p className="font-semibold text-midnight">{study.author}</p>
                    <p className="text-[14px] text-pewter">
                      {study.role}, {study.company}
                    </p>
                  </footer>
                </article>
              ))}
            </div>
          </Container>
        </section>
      );
    case "team":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <div className="grid gap-5 sm:grid-cols-3">
              {section.members.map((member) => (
                <article key={member.name} className="rounded border border-line bg-white p-6 shadow-soft">
                  <h3 className="text-[17px] font-semibold text-midnight">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-iris">{member.role}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-steel">{member.bio}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      );
    case "jobs":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <div className="space-y-4">
              {section.items.map((job) => (
                <article key={job.title} className="rounded border border-line bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-midnight">{job.title}</h3>
                      <p className="mt-1 text-sm text-pewter">
                        {job.location} · {job.type}
                      </p>
                    </div>
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=Candidature`}
                      className="rounded bg-iris px-4 py-2 text-[14px] font-medium text-white hover:bg-iris-hover"
                    >
                      Postuler
                    </a>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-steel">{job.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      );
    case "podcast":
      return (
        <section className="bg-snow">
          <Container className="py-12 lg:py-16">
            <div className="space-y-4">
              {section.episodes.map((ep) => (
                <article key={ep.title} className="rounded border border-line bg-white p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pewter">{ep.date}</p>
                  <h3 className="mt-2 text-lg font-semibold text-midnight">{ep.title}</h3>
                  <p className="mt-1 text-sm font-medium text-iris">Invité : {ep.guest}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-steel">{ep.description}</p>
                </article>
              ))}
            </div>
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

function ContactForm({ variant }: { variant: "demo" | "contact" }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Reveal>
        <div className="mx-auto max-w-lg rounded border border-line bg-snow p-8 text-center">
          <p className="text-lg font-semibold text-midnight">Message envoyé</p>
          <p className="mt-2 text-[15px] text-steel">Nous vous recontactons sous 24 heures ouvrées.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <form
      className="mx-auto max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
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
        {variant === "demo" ? "Réserver ma démo" : "Envoyer"}
      </button>
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

function RoiCalculator() {
  const [responses, setResponses] = useState(24);
  const [daysPerResponse, setDaysPerResponse] = useState(8);
  const [dailyCost, setDailyCost] = useState(600);

  const currentCost = responses * daysPerResponse * dailyCost;
  const savedPercent = 0.7;
  const saved = Math.round(currentCost * savedPercent);
  const extraResponses = Math.round(responses * 1.4) - responses;

  return (
    <div className="mx-auto max-w-2xl rounded border border-line bg-white p-8 shadow-soft">
      <div className="space-y-6">
        <SliderField label="Réponses par an" value={responses} min={5} max={80} onChange={setResponses} />
        <SliderField label="Jours par réponse" value={daysPerResponse} min={2} max={20} onChange={setDaysPerResponse} />
        <SliderField label="Coût journalier (€)" value={dailyCost} min={300} max={1500} step={50} onChange={setDailyCost} />
      </div>
      <div className="mt-10 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
        <ResultCard label="Coût annuel actuel" value={`${currentCost.toLocaleString("fr-FR")} €`} />
        <ResultCard label="Économie estimée (70 %)" value={`${saved.toLocaleString("fr-FR")} €`} highlight />
        <ResultCard label="Réponses supplémentaires" value={`+${extraResponses} / an`} />
      </div>
      <p className="mt-6 text-center text-[13px] text-pewter">
        Estimation indicative.{" "}
        <Link href="/demo" className="font-semibold text-iris">
          Demandez une démo
        </Link>{" "}
        pour un chiffrage sur vos propres dossiers.
      </p>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-midnight">{label}</label>
        <span className="text-sm font-semibold text-iris">{value.toLocaleString("fr-FR")}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-iris"
      />
    </div>
  );
}

function ResultCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded p-4 text-center ${highlight ? "bg-periwinkle/50 ring-1 ring-iris/20" : "bg-snow"}`}>
      <p className="text-2xl font-semibold tracking-tight text-midnight">{value}</p>
      <p className="mt-1 text-[13px] text-pewter">{label}</p>
    </div>
  );
}

import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const pains = [
  {
    title: "Des DCE lus dans l'urgence",
    description: "Dates clés, pénalités et dérogations au CCAG passent parfois inaperçues avant d'engager le bureau d'études.",
  },
  {
    title: "La même matière réécrite à chaque AO",
    description: "Méthodologies, références chantiers et certifications sont dispersées entre serveurs, mails et disques personnels.",
  },
  {
    title: "Des dépôts sous tension",
    description: "Plusieurs contributeurs, une échéance fixe : le mémoire part dans l'urgence, au détriment de la note technique.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-canvas">
      <Container className="py-14 lg:py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Le constat</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-4xl">
            Répondre aux AO ne devrait pas mobiliser des semaines entières
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            MateriaBTP est en phase de lancement. Nous ouvrons un programme pilote avec des entreprises du BTP prêtes à tester l&apos;outil sur leurs vrais dossiers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pains.map((pain, index) => (
            <Reveal key={pain.title} delay={index * 80}>
              <article className="h-full rounded border border-line bg-white p-7 shadow-soft">
                <h3 className="text-[17px] font-semibold text-midnight">{pain.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-steel">{pain.description}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ArrowLink
            href="/demo"
            className="rounded bg-iris px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-iris-hover"
            showArrow={false}
          >
            Rejoindre le programme pilote
          </ArrowLink>
          <ArrowLink href="/produit/analyse-go-no-go" className="text-[15px] font-semibold text-iris">
            Voir comment ça marche
          </ArrowLink>
        </Reveal>
      </Container>
    </section>
  );
}

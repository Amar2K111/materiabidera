import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";

const pains = [
  {
    title: "Le CCAP lu la veille du dépôt",
    description: "Pénalités sans plafond, visites obligatoires, dérogations au CCAG Travaux : les points qui coûtent cher passent souvent inaperçus dans l'urgence.",
  },
  {
    title: "La même matière réécrite à chaque AO",
    description: "Méthodes de phasage, références scolaires, certifications Qualibat : tout existe déjà, mais éparpillé entre serveurs, mails et anciens mémoires.",
  },
  {
    title: "Le mémoire monté dans l'urgence",
    description: "Conducteur de travaux, chargé d'affaires, direction : plusieurs mains, une date limite — la note technique en pâtit.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-canvas">
      <Container className="py-14 lg:py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Le constat</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-4xl">
            Répondre aux AO ne devrait pas mobiliser toute l&apos;entreprise
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            MateriaBTP est en phase de lancement. Nous recrutons des entreprises de travaux prêtes à tester l&apos;outil sur leurs vrais dossiers — pas sur des exemples génériques.
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

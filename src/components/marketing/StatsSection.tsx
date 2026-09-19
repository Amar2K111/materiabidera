import { Container } from "@/components/marketing/ui/Container";

const stats = [
  { value: "8", label: "facteurs notés et justifiés à chaque Go/No-Go, sources à l'appui" },
  { value: "2", label: "sources de vérité : les pièces du DCE et votre base entreprise" },
  { value: "1 clic", label: "pour lancer la rédaction de l'ensemble du mémoire technique" },
  { value: "0", label: "entraînement de modèle sur vos documents par MateriaBTP" },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-snow py-10 lg:py-14">
      <Container className="relative">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-l-2 border-iris/40 pl-5">
              <dd className="text-iris-gradient text-3xl font-medium tabular-nums tracking-[-0.02em] lg:text-[2.35rem]">
                {stat.value}
              </dd>
              <dt className="mt-2 max-w-[16rem] text-sm leading-relaxed text-pewter">{stat.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-[13px] leading-relaxed text-pewter">
          Caractéristiques produit, pas promesses marketing : MateriaBTP est en lancement. Jugez sur l&apos;un de vos propres DCE, en démonstration de 30 minutes.
        </p>
      </Container>
    </section>
  );
}

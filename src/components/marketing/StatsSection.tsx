import { Container } from "@/components/marketing/ui/Container";

const stats = [
  { value: "Quelques min", label: "pour synthétiser un DCE (RC, CCAP, CCTP)" },
  { value: "48 h", label: "pour structurer votre base et générer une 1re réponse" },
  { value: "100 %", label: "des données hébergées en France · SecNumCloud" },
  { value: "0", label: "entraînement de modèles tiers sur vos documents" },
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
          Chiffres liés au produit et à notre engagement souveraineté — pas des résultats clients. Le ROI se chiffre sur votre propre DCE, en démo de 30 minutes.
        </p>
      </Container>
    </section>
  );
}

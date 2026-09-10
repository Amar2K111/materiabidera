import { getAppContext } from "@/lib/data/context";
import { getAiConfig, isStripeConfigured } from "@/lib/env";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { OrganizationForm } from "./organization-form";

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietaire",
  admin: "Administrateur",
  member: "Membre",
};

export default async function ParametresPage() {
  const ctx = await getAppContext();
  if (!ctx?.organization) return null;

  const ai = getAiConfig();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parametres"
        subtitle="Informations de votre entreprise, compte utilisateur et etat des services connectes."
      />

      <OrganizationForm organization={ctx.organization} />

      <Card>
        <CardHeader>
          <CardTitle>Votre compte</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Adresse e-mail</span>
            <span className="font-semibold">{ctx.email ?? "Non renseignee"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Role</span>
            <span className="font-semibold">
              {ROLE_LABELS[ctx.role ?? "member"]}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services connectes</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Base de donnees</p>
              <p className="text-[12.5px] text-ink-42">
                Stockage et isolation de vos donnees
              </p>
            </div>
            <Badge tone="ok">Connectee</Badge>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-3">
            <div>
              <p className="font-semibold">Moteur d&apos;analyse</p>
              <p className="text-[12.5px] text-ink-42">
                {ai.configured
                  ? `Fournisseur : ${ai.provider}`
                  : "Requis pour analyser un DCE et rediger un memoire"}
              </p>
            </div>
            <Badge tone={ai.configured ? "ok" : "warn"}>
              {ai.configured ? "Configure" : "Non configure"}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-3">
            <div>
              <p className="font-semibold">Abonnement</p>
              <p className="text-[12.5px] text-ink-42">
                Facturation et gestion des licences
              </p>
            </div>
            <Badge tone={isStripeConfigured ? "ok" : "neutral"}>
              {isStripeConfigured ? "Configure" : "Non configure"}
            </Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

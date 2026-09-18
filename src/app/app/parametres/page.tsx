import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAppContext } from "@/lib/data/context";
import { isStripeConfigured } from "@/lib/env";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { getQualificationRules } from "@/lib/data/qualification";
import { QualificationRulesEditor } from "@/components/app/qualification-rules-editor";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  member: "Membre",
};

export default async function ParametresPage() {
  const ctx = await getAppContext();
  if (!ctx?.organization) return null;
  const qualification = await getQualificationRules(ctx.organization.id);
  const canEdit = ctx.role === "owner" || ctx.role === "admin";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Paramètres"
        subtitle="Informations de votre entreprise, critères de qualification, compte utilisateur et état des services connectés."
      />

      {/* L'identite de l'entreprise se modifie dans la base entreprise, ou elle
          sert a la redaction. La dupliquer ici creait deux formulaires pour la
          meme donnee, sans indiquer lequel faisait foi. */}
      <Card>
        <CardHeader>
          <CardTitle>Votre entreprise</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Raison sociale</span>
            <span className="text-right font-semibold">
              {ctx.organization.name}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Activité</span>
            <span className="text-right font-semibold">
              {ctx.organization.activity_type ?? (
                <span className="font-normal text-ink-58">Non renseignée</span>
              )}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Zone d&apos;intervention</span>
            <span className="text-right font-semibold">
              {ctx.organization.intervention_area ?? (
                <span className="font-normal text-ink-58">Non renseignée</span>
              )}
            </span>
          </div>
          <div className="border-t border-line-soft pt-3">
            <Link
              href="/app/base-entreprise"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand underline-offset-4 hover:underline"
            >
              Modifier dans la base entreprise
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </CardBody>
      </Card>

      {qualification.available ? (
        <QualificationRulesEditor
          organizationId={ctx.organization.id}
          interventionArea={ctx.organization.intervention_area ?? null}
          initialRules={qualification.rules}
          canEdit={canEdit}
        />
      ) : (
        <Notice tone="info" title="Critères de qualification Go / No-Go">
          Cette fonctionnalité sera disponible une fois la migration
          0011_qualification_outcome appliquée à la base de données.
        </Notice>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre compte</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Adresse e-mail</span>
            <span className="font-semibold">{ctx.email ?? "Non renseignée"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-58">Rôle</span>
            <span className="font-semibold">
              {ROLE_LABELS[ctx.role ?? "member"]}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services connectés</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Base de données</p>
              <p className="text-[12.5px] text-ink-42">
                Stockage et isolation de vos données
              </p>
            </div>
            <Badge tone="ok">Connectée</Badge>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-3">
            <div>
              <p className="font-semibold">Abonnement</p>
              <p className="text-[12.5px] text-ink-42">
                Facturation et gestion des licences
              </p>
            </div>
            <Badge tone={isStripeConfigured ? "ok" : "neutral"}>
              {isStripeConfigured ? "Configuré" : "Non configuré"}
            </Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

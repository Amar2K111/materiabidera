"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { DceUploader } from "@/components/app/dce-uploader";

export function NewProjectFlow({ organizationId }: { organizationId: string }) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);

  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [buyer, setBuyer] = useState("");
  const [lot, setLot] = useState("");
  const [deadline, setDeadline] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        organization_id: organizationId,
        name: name.trim(),
        reference: reference.trim() || null,
        buyer: buyer.trim() || null,
        lot: lot.trim() || null,
        // Le champ est une date seule ; la remise est fixee en fin de journee.
        deadline: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setError(
        "La creation du dossier a echoue. Merci de reessayer dans un instant.",
      );
      setPending(false);
      return;
    }

    setProjectId(data.id);
    setStep(2);
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <nav className="text-[13px] font-semibold text-ink-42">
        <Link href="/app/dossiers" className="hover:text-ink">
          Dossiers
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink">Nouveau dossier</span>
      </nav>

      <div className="mt-5 flex gap-1.5" aria-hidden>
        <span className="h-1 flex-1 rounded-full bg-brand" />
        <span
          className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-brand" : "bg-line"}`}
        />
      </div>
      <p className="mt-3 text-[12.5px] font-bold text-ink-42">
        Etape {step} sur 2
      </p>

      {error ? (
        <div className="mt-6">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={createProject} className="mt-6">
          <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
            Identifier la consultation
          </h1>
          <p className="mt-2 text-[14px] text-ink-58">
            Ces informations structurent le dossier et permettent de suivre
            l&apos;echeance de remise.
          </p>

          <div className="mt-7">
            <Label htmlFor="name">Objet du marche</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Rehabilitation du groupe scolaire Jean Moulin"
              autoFocus
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="reference">Reference de la consultation</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex. 2026-TRV-014"
              />
            </div>
            <div>
              <Label htmlFor="lot">Lot</Label>
              <Input
                id="lot"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="Ex. Lot 03 - Enveloppe"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="buyer">Acheteur ou maitre d&apos;ouvrage</Label>
            <Input
              id="buyer"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="Ex. Commune de Saint-Martin"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="deadline">Date limite de remise</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <FieldHint>
              Utilisee pour le decompte des jours restants sur votre tableau de
              bord.
            </FieldHint>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link href="/app/dossiers">
              <Button type="button" variant="ghost" className="h-11">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="h-11 flex-1"
              disabled={pending || name.trim().length < 3}
            >
              {pending ? "Creation..." : "Continuer"}
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 && projectId ? (
        <div className="mt-6">
          <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
            Deposer le DCE
          </h1>
          <p className="mt-2 text-[14px] text-ink-58">
            Ajoutez le reglement de consultation, le CCTP, le CCAP, la DPGF et
            toute autre piece utile. Vous pourrez en ajouter d&apos;autres plus
            tard.
          </p>

          <div className="mt-7">
            <DceUploader
              organizationId={organizationId}
              projectId={projectId}
              onUploaded={(count) => setUploadedCount((c) => c + count)}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Button
              type="button"
              className="h-11"
              onClick={() => {
                router.push(`/app/dossiers/${projectId}`);
                router.refresh();
              }}
            >
              Ouvrir le dossier
            </Button>
            {uploadedCount === 0 ? (
              <span className="text-[13px] text-ink-42">
                Vous pouvez aussi deposer les pieces plus tard.
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/lib/data/context";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export function OrganizationForm({
  organization,
}: {
  organization: Organization;
}) {
  const router = useRouter();

  const [name, setName] = useState(organization.name);
  const [activity, setActivity] = useState(organization.activity_type ?? "");
  const [presentation, setPresentation] = useState(
    organization.presentation ?? "",
  );
  const [area, setArea] = useState(organization.intervention_area ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        name: name.trim(),
        activity_type: activity.trim() || null,
        presentation: presentation.trim() || null,
        intervention_area: area.trim() || null,
      })
      .eq("id", organization.id);

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre entreprise</CardTitle>
      </CardHeader>
      <CardBody>
        {status === "error" ? (
          <div className="mb-4">
            <Notice tone="risk">
              L&apos;enregistrement a echoue. Verifiez vos droits puis
              reessayez.
            </Notice>
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Raison sociale</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="activity">Activite principale</Label>
              <Input
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="area">Zones d&apos;intervention</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="presentation">Presentation</Label>
            <Textarea
              id="presentation"
              rows={6}
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Enregistrement..." : "Enregistrer"}
            </Button>
            {status === "saved" ? (
              <span className="text-[13px] font-semibold text-ok">
                Modifications enregistrees
              </span>
            ) : null}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

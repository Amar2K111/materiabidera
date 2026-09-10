"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  displayValue,
  type CollectionDef,
  type FieldDef,
} from "@/lib/company";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

type Row = Record<string, unknown> & { id: string };

/**
 * Liste et formulaire d'une collection de la base entreprise.
 *
 * L'ecriture passe par le client navigateur, donc sous les regles d'acces de
 * la base : une ligne d'une autre organisation est hors de portee, meme en
 * forgeant une requete.
 */
export function CollectionEditor({
  collection,
  rows,
  organizationId,
}: {
  collection: CollectionDef;
  rows: Row[];
  organizationId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function remove(id: string) {
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from(collection.table)
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("La suppression n'a pas pu etre effectuee.");
      return;
    }
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-[62ch] text-[13.5px] text-ink-58">
          {collection.purpose}
        </p>
        {rows.length > 0 ? (
          <Button type="button" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            {collection.addLabel}
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {rows.length === 0 ? (
        <EmptyState
          title={`Aucune fiche pour le moment`}
          description={collection.emptyDescription}
          action={
            <Button onClick={() => setEditing("new")}>
              {collection.addLabel}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const summary = collection.summaryFields
              .map((key) =>
                displayValue(
                  collection.fields.find((f) => f.key === key),
                  row[key],
                ),
              )
              .filter(Boolean)
              .join(" | ");

            return (
              <li
                key={row.id}
                className="rounded-[10px] border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold">
                      {String(row[collection.titleField] ?? "Sans titre")}
                    </h3>
                    {summary ? (
                      <p className="mt-1 text-[12.5px] text-ink-58">{summary}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-none gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      aria-label="Modifier"
                      className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(row.id)}
                      aria-label="Supprimer"
                      className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-risk-wash hover:text-risk"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {pendingDelete === row.id ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line-soft pt-4">
                    <span className="text-[13px] font-semibold">
                      Supprimer cette fiche definitivement ?
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => remove(row.id)}
                    >
                      Supprimer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingDelete(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {editing ? (
        <CollectionForm
          collection={collection}
          organizationId={organizationId}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function CollectionForm({
  collection,
  organizationId,
  row,
  onClose,
  onSaved,
}: {
  collection: CollectionDef;
  organizationId: string;
  row: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of collection.fields) {
      const value = row?.[field.key];
      initial[field.key] = value === null || value === undefined ? "" : String(value);
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Un champ laisse vide est enregistre comme absent, jamais comme une
    // chaine vide : l'information manquante doit rester identifiable.
    const payload: Record<string, unknown> = {};
    for (const field of collection.fields) {
      const raw = values[field.key]?.trim() ?? "";
      if (raw === "") {
        payload[field.key] = null;
      } else if (field.type === "number") {
        const n = Number(raw);
        payload[field.key] = Number.isFinite(n) ? n : null;
      } else {
        payload[field.key] = raw;
      }
    }

    const supabase = createClient();
    const { error: writeError } = row
      ? await supabase.from(collection.table).update(payload).eq("id", row.id)
      : await supabase
          .from(collection.table)
          .insert({ ...payload, organization_id: organizationId });

    if (writeError) {
      setError("L'enregistrement a echoue. Merci de reessayer.");
      setSaving(false);
      return;
    }

    onSaved();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[560px] flex-col border-l border-line bg-white shadow-ui"
        role="dialog"
        aria-label={row ? "Modifier la fiche" : collection.addLabel}
      >
        <header className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[14px] font-bold">
            {row ? "Modifier la fiche" : collection.addLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {error ? (
              <div className="mb-5">
                <Notice tone="risk">{error}</Notice>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {collection.fields.map((field) => (
                <div
                  key={field.key}
                  className={field.wide ? "sm:col-span-2" : undefined}
                >
                  <FieldInput
                    field={field}
                    value={values[field.key] ?? ""}
                    onChange={(v) =>
                      setValues((prev) => ({ ...prev, [field.key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <footer className="flex flex-none items-center gap-3 border-t border-line px-5 py-4">
            <Button type="submit" disabled={saving} className="h-11 flex-1">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={onClose}
            >
              Annuler
            </Button>
          </footer>
        </form>
      </aside>
    </>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `field-${field.key}`;

  return (
    <>
      <Label htmlFor={id}>{field.label}</Label>

      {field.type === "textarea" ? (
        <Textarea
          id={id}
          rows={4}
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-[8px] border border-line bg-white px-3 text-[14px] focus:border-brand focus:outline-none"
        >
          <option value="">Non precise</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : "text"
          }
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.hint ? <FieldHint>{field.hint}</FieldHint> : null}
    </>
  );
}

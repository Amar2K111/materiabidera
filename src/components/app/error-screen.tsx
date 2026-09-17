"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Ecran de panne (section 26).
 *
 * Trois choses a dire a un responsable etudes : ce qui s'est passe, ce que
 * devient son travail, et quoi faire maintenant. Jamais de trace technique :
 * l'identifiant reste discret, pour le support.
 */
export function ErrorScreen({
  error,
  retry,
  title,
  description,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-[10px] border border-line bg-white px-6 py-14 text-center"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-warn-wash text-warn">
        <TriangleAlert className="h-5 w-5" strokeWidth={1.8} aria-hidden />
      </div>
      <h1 className="text-[16px] font-bold">{title}</h1>
      <p className="mt-2 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-58">
        {description} Rien n&rsquo;a été perdu : votre travail enregistré est
        intact.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => retry()}>
          <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
          Réessayer
        </Button>
        <ButtonLink href={backHref} variant="ghost">
          {backLabel}
        </ButtonLink>
      </div>

      {error.digest ? (
        <p className="mt-6 text-[11.5px] text-ink-58">
          Si le problème persiste, communiquez cette référence au support :{" "}
          <span className="font-medium text-ink-70">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Variante 404 : la page existe dans l'application, pas la donnee demandee. */
export function MissingScreen({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line px-6 py-14 text-center">
      <h1 className="text-[16px] font-bold">{title}</h1>
      <p className="mt-2 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-58">
        {description}
      </p>
      <div className="mt-6">
        <Link
          href={backHref}
          className="text-[13px] font-semibold text-brand underline-offset-4 hover:underline"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

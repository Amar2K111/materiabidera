"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isDemoAccessEnabledClient } from "@/lib/demo-access";

type DemoAccessButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function DemoAccessButton({
  className = "btn btn--ghost",
  children = "Accéder à l'app",
}: DemoAccessButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isDemoAccessEnabledClient()) return null;

  async function onClick() {
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(body.error ?? "Connexion impossible.");
      }

      router.push("/app");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
      setPending(false);
    }
  }

  return (
    <span className="demo-access-wrap">
      <button type="button" className={className} onClick={onClick} disabled={pending}>
        {pending ? "Connexion..." : children}
      </button>
      {error ? (
        <span className="demo-access-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

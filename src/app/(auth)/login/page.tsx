"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suite = params.get("suite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authErrorMessage(authError.message));
      setPending(false);
      return;
    }

    // refresh() force le middleware a relire la session fraichement posee.
    router.replace(suite && suite.startsWith("/") ? suite : "/app");
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${
          suite ? `?suite=${encodeURIComponent(suite)}` : ""
        }`,
      },
    });
    if (authError) setError(authErrorMessage(authError.message));
  }

  return (
    <>
      <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
        Connexion
      </h1>
      <p className="mt-2 text-[14px] text-ink-58">
        Accedez a vos dossiers d&apos;appels d&apos;offres.
      </p>

      {error ? (
        <div className="mt-6">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6">
        <div>
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@entreprise.fr"
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={pending} className="mt-6 h-11 w-full">
          {pending ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] font-semibold text-ink-42">ou</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onGoogle}
        className="h-11 w-full"
      >
        Continuer avec Google
      </Button>

      <p className="mt-8 text-center text-[13.5px] text-ink-58">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-brand">
          Creer un compte
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

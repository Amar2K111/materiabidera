"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authErrorMessage(authError.message));
      setPending(false);
      return;
    }

    // Sans session retournee, la confirmation par e-mail est active
    // sur le projet Supabase : on le dit plutot que de rediriger dans le vide.
    if (!data.session) {
      setCheckInbox(true);
      setPending(false);
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  }

  if (checkInbox) {
    return (
      <>
        <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
          Verifiez votre boite de reception
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-70">
          Un lien de confirmation vient d&apos;etre envoye a{" "}
          <span className="font-semibold">{email}</span>. Ouvrez-le pour activer
          votre compte, puis revenez vous connecter.
        </p>
        <Link href="/login">
          <Button variant="ghost" className="mt-6 h-11 w-full">
            Retour a la connexion
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
        Creer un compte
      </h1>
      <p className="mt-2 text-[14px] text-ink-58">
        Quelques minutes suffisent pour analyser votre premier DCE.
      </p>

      {error ? (
        <div className="mt-6">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6">
        <div>
          <Label htmlFor="fullName">Nom et prenom</Label>
          <Input
            id="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="email">Adresse e-mail professionnelle</Label>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldHint>8 caracteres minimum.</FieldHint>
        </div>

        <Button type="submit" disabled={pending} className="mt-6 h-11 w-full">
          {pending ? "Creation en cours..." : "Creer mon compte"}
        </Button>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-ink-58">
        Deja un compte ?{" "}
        <Link href="/login" className="font-bold text-brand">
          Se connecter
        </Link>
      </p>
    </>
  );
}

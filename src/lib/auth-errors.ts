/**
 * Traduction des erreurs d'authentification en messages utilisateur.
 * Section 26 : ne jamais afficher une erreur technique brute.
 */
export function authErrorMessage(raw: string | undefined): string {
  const m = (raw ?? "").toLowerCase();

  if (m.includes("invalid login credentials"))
    return "Adresse e-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed"))
    return "Votre adresse e-mail n'a pas encore ete confirmee. Consultez votre boite de reception.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Un compte existe deja avec cette adresse e-mail.";
  if (m.includes("password should be at least"))
    return "Le mot de passe doit contenir au moins 8 caracteres.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Trop de tentatives. Merci de reessayer dans quelques minutes.";
  if (m.includes("network") || m.includes("fetch"))
    return "Connexion au service impossible. Verifiez votre reseau puis reessayez.";
  if (m.includes("provider is not enabled"))
    return "Cette methode de connexion n'est pas activee sur ce projet.";

  return "La connexion a echoue. Merci de reessayer.";
}

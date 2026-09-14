/**
 * Acces demo : connexion automatique au compte de demonstration.
 *
 * Actif en developpement, ou en production uniquement si ENABLE_DEMO_ACCESS
 * vaut "true". Sans cette variable, l'application exige une vraie connexion :
 * le compte demo n'est jamais ouvert a n'importe quel visiteur par defaut.
 */
export function isDemoAccessEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_DEMO_ACCESS === "true"
  );
}

/** Version utilisable cote client (NEXT_PUBLIC_ pour override explicite). */
export function isDemoAccessEnabledClient() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCESS === "true") return true;
  return process.env.NODE_ENV === "development";
}

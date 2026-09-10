/**
 * Ponderation des facteurs du score Go / No-Go.
 *
 * Elle est fixe et affichee dans l'interface : le modele note chaque facteur,
 * l'application calcule le score. C'est ce qui rend la note reproductible et
 * discutable, plutot qu'un chiffre tombe d'on ne sait ou (section 12).
 */
export const FACTOR_WEIGHTS: Record<string, number> = {
  technical_fit: 18,
  experience: 16,
  criteria: 14,
  capacity: 12,
  administrative: 12,
  schedule: 10,
  contract_risk: 10,
  site: 8,
};

/** Seuils de recommandation appliques au score global. */
export const GO_THRESHOLD = 70;
export const VIGILANCE_THRESHOLD = 45;

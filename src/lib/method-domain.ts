/**
 * Rangement des methodes de la base entreprise.
 */
export type Domain =
  | "CHANTIER"
  | "QUALITE"
  | "SECURITE"
  | "ENVIRONNEMENT"
  | "ORGANISATION"
  | "AUTRE";

/**
 * Domaine de methode deduit de l'intitule du chapitre. Simple rangement
 * initial : l'utilisateur le corrige dans ses methodes s'il le souhaite.
 */
export function guessDomain(title: string): Domain {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (/securit|prevention|sps|risque/.test(t)) return "SECURITE";
  if (/environnement|dechet|nuisance|rse|carbone|reemploi/.test(t)) return "ENVIRONNEMENT";
  if (/qualite|controle|autocontrole|reception/.test(t)) return "QUALITE";
  if (/organisation|moyens humains|equipe|planning|delai|encadrement/.test(t)) return "ORGANISATION";
  if (/methodologie|execution|mode operatoire|chantier|phasage|travaux/.test(t)) return "CHANTIER";
  return "AUTRE";
}

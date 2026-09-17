/**
 * Etat replie de la barre laterale, conserve d'une visite a l'autre.
 *
 * La preference est lue avant le premier affichage par un petit script insere
 * dans la mise en page : sans lui, la page s'affichait d'abord avec la barre
 * depliee, puis sautait de 248 px a 72 px apres l'hydratation, decalant tout le
 * contenu sous les yeux de l'utilisateur.
 *
 * Source unique : localStorage. L'attribut sur <html> et l'etat React n'en sont
 * que des reflets, mis a jour ensemble par setSidebarCollapsed.
 */
const KEY = "materiabtp-sidebar-collapsed";

/** Script execute avant le premier rendu visuel. Doit rester minuscule. */
export const SIDEBAR_PREPAINT = `try{document.documentElement.dataset.sidebar=localStorage.getItem(${JSON.stringify(
  KEY,
)})==="1"?"collapsed":"expanded"}catch(e){}`;

const listeners = new Set<() => void>();

export function subscribeSidebar(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Cote serveur, la barre est toujours rendue depliee. */
export function getSidebarCollapsedOnServer(): boolean {
  return false;
}

export function setSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(KEY, collapsed ? "1" : "0");
  } catch {
    /* navigation privee ou stockage refuse : la preference n'est pas retenue */
  }
  document.documentElement.dataset.sidebar = collapsed
    ? "collapsed"
    : "expanded";
  for (const listener of listeners) listener();
}

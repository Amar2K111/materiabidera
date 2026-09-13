/**
 * Ouverture et telechargement de fichiers depuis un lien obtenu apres un
 * appel reseau.
 *
 * Les navigateurs bloquent un window.open declenche apres un await : le geste
 * de l'utilisateur est considere comme perdu. On ouvre donc l'onglet pendant le
 * clic, puis on y charge le lien une fois connu.
 */

/** Ouvre un onglet vide pendant le clic ; a appeler avant tout await. */
export function reserveTab(): Window | null {
  const tab = window.open("", "_blank");
  if (tab) {
    tab.opener = null;
    tab.document.title = "Ouverture du document…";
  }
  return tab;
}

/** Charge le lien dans l'onglet reserve, ou dans l'onglet courant a defaut. */
export function openInTab(tab: Window | null, url: string) {
  if (tab && !tab.closed) {
    tab.location.href = url;
    return;
  }
  window.location.assign(url);
}

/**
 * Telecharge un fichier servi en piece jointe : la page reste en place, aucun
 * onglet n'est ouvert.
 */
export function triggerDownload(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

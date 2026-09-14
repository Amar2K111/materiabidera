// Test d'isolation entre organisations, avec deux comptes reels.
//
// Cree un utilisateur temporaire B et son organisation, puis verifie que B ne
// peut ni lire, ni ecrire, ni modifier, ni supprimer les donnees d'une
// organisation A existante : API de donnees (RLS), stockage de fichiers, routes
// et pages de l'application. L'utilisateur B et son organisation sont
// supprimes a la fin, meme en cas d'echec.
//
// Usage : node scripts/test-org-isolation.mjs [projectIdDeA] [urlApp]
//   - projectIdDeA : dossier de l'organisation A (defaut : le plus recent)
//   - urlApp : application lancee (defaut http://localhost:3000) ; les
//     verifications de l'application sont ignorees si elle ne repond pas.
// Lit NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et
// SUPABASE_SERVICE_ROLE_KEY dans .env.local. N'affiche jamais les cles.

import fs from "node:fs";
import crypto from "node:crypto";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const APP = process.argv[3] ?? "http://localhost:3000";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "OK  " : "ECHEC"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const service = (path, init = {}) =>
  fetch(`${URL_}${path}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
let tokenB = null;
const asB = (path, init = {}) =>
  fetch(`${URL_}${path}`, {
    ...init,
    headers: { apikey: ANON, Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
const json = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// --- Organisation A : donnees existantes ------------------------------------------
const projectId =
  process.argv[2] ??
  (await json(await service("/rest/v1/projects?select=id&order=created_at.desc&limit=1")))[0]?.id;
if (!projectId) {
  console.error("Aucun dossier existant : creez-en un pour l'organisation A.");
  process.exit(2);
}
const [project] = await json(await service(`/rest/v1/projects?id=eq.${projectId}&select=id,name,organization_id`));
const orgA = project.organization_id;
console.log(`Organisation A : ${orgA} (dossier ${projectId})\n`);

const TABLES = [
  "projects", "project_documents", "document_pages", "dce_analyses", "requirements",
  "requirement_sources", "go_no_go_analyses", "go_no_go_factors", "tender_strategies",
  "memory_sections", "memory_sources", "memory_section_versions", "quality_checks",
  "quality_issues", "checklist_items", "exports", "ai_runs", "company_references",
  "company_employees", "company_equipment", "company_certifications",
  "company_qualifications", "company_methods", "company_documents",
  "company_document_pages", "embeddings", "organization_members",
];

// Echantillon de A, relu par la cle de service pour comparer apres les attaques.
const countA = async (table) => {
  const res = await service(`/rest/v1/${table}?organization_id=eq.${orgA}&select=organization_id`, {
    method: "HEAD",
    headers: { Prefer: "count=exact" },
  });
  return Number(res.headers.get("content-range")?.split("/")[1] ?? "NaN");
};
const before = {};
for (const table of TABLES) before[table] = await countA(table);

// --- Utilisateur B et son organisation ---------------------------------------------
const email = `isolation-${Date.now()}@example.com`;
const password = crypto.randomBytes(18).toString("base64url");
let userB = null;
let orgB = null;

try {
  const created = await json(
    await service("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({ email, password, email_confirm: true }),
    }),
  );
  userB = created.id;
  if (!userB) throw new Error(`creation de B impossible : ${JSON.stringify(created).slice(0, 200)}`);

  const session = await json(
    await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  tokenB = session.access_token;
  if (!tokenB) throw new Error("connexion de B impossible");

  orgB = await json(
    await asB("/rest/v1/rpc/create_organization", {
      method: "POST",
      body: JSON.stringify({ org_name: "Test isolation B" }),
    }),
  );
  check("B cree sa propre organisation", typeof orgB === "string" && orgB !== orgA);

  // --- 1. Lecture ------------------------------------------------------------------
  for (const table of TABLES) {
    const rows = await json(await asB(`/rest/v1/${table}?organization_id=eq.${orgA}&select=*&limit=5`));
    if (rows?.code === "PGRST205") {
      console.log(`--   ${table} : table absente (migration non appliquee), ignoree`);
      continue;
    }
    const leaked = Array.isArray(rows) ? rows.length : -1;
    check(`lecture ${table} de A`, leaked === 0, leaked === -1 ? `reponse ${JSON.stringify(rows).slice(0, 80)}` : `${leaked} ligne(s)`);
  }
  const orgs = await json(await asB(`/rest/v1/organizations?select=id`));
  check("B ne voit que son organisation", Array.isArray(orgs) && orgs.length === 1 && orgs[0].id === orgB);
  const byId = await json(await asB(`/rest/v1/projects?id=eq.${projectId}&select=id`));
  check("lecture du dossier de A par identifiant", Array.isArray(byId) && byId.length === 0);

  // --- 2. Ecriture dans A ------------------------------------------------------------
  const insertProject = await asB("/rest/v1/projects", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ organization_id: orgA, name: "intrusion", created_by: userB }),
  });
  check("creation d'un dossier dans A refusee", insertProject.status >= 400, `HTTP ${insertProject.status}`);

  const joinOrg = await asB("/rest/v1/organization_members", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ organization_id: orgA, user_id: userB, role: "owner" }),
  });
  check("B ne peut pas s'ajouter comme membre de A", joinOrg.status >= 400, `HTTP ${joinOrg.status}`);

  // Chapitre reel de A : un refus ne peut donc pas venir d'une cle etrangere.
  const [sectionA] = await json(await service(`/rest/v1/memory_sections?organization_id=eq.${orgA}&select=id&limit=1`));
  if (sectionA) {
    const insertVersion = await asB("/rest/v1/memory_section_versions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ organization_id: orgA, section_id: sectionA.id, content: "intrusion" }),
    });
    check("ecriture d'une version de chapitre dans A refusee", insertVersion.status >= 400, `HTTP ${insertVersion.status}`);
    // Meme en declarant sa propre organisation, B ne peut pas viser un chapitre de A.
    const crossVersion = await asB("/rest/v1/memory_section_versions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ organization_id: orgB, section_id: sectionA.id, content: "intrusion" }),
    });
    check(
      "version rattachee a un chapitre de A sous l'organisation de B",
      crossVersion.status >= 400,
      `HTTP ${crossVersion.status}`,
    );
  }

  // Rattachement a un parent de A en declarant l'organisation de B : la ligne
  // serait invisible pour A mais lue par ses traitements serveur.
  const [docOfA] = await json(await service(`/rest/v1/project_documents?organization_id=eq.${orgA}&select=id,storage_path&limit=1`));
  const [requirementA] = await json(await service(`/rest/v1/requirements?organization_id=eq.${orgA}&select=id&limit=1`));
  const crossAttempts = [
    ["project_documents", { organization_id: orgB, project_id: projectId, storage_path: `${orgB}/x/intrusion.pdf`, file_name: "intrusion.pdf" }],
    ["requirements", { organization_id: orgB, project_id: projectId, text: "intrusion", category: "AUTRE", priority: "LOW" }],
    ["memory_sections", { organization_id: orgB, project_id: projectId, position: 99, title: "intrusion" }],
    ["checklist_items", { organization_id: orgB, project_id: projectId, group_name: "CONTROLE", label: "intrusion", auto_key: "intrusion" }],
  ];
  for (const [table, body] of crossAttempts) {
    const res = await asB(`/rest/v1/${table}`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    check(`${table} rattache au dossier de A sous l'organisation de B`, res.status >= 400, `HTTP ${res.status}`);
  }

  // Projet de B, puis tentative de lui rattacher un fichier ou une exigence de A.
  const projectB = await json(
    await asB("/rest/v1/projects", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ organization_id: orgB, name: "Dossier B", created_by: userB }),
    }),
  );
  const projectBId = Array.isArray(projectB) ? projectB[0]?.id : null;
  check("B cree un dossier dans sa propre organisation", Boolean(projectBId));
  if (projectBId && docOfA?.storage_path) {
    const stolen = await asB("/rest/v1/project_documents", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ organization_id: orgB, project_id: projectBId, storage_path: docOfA.storage_path, file_name: "copie.pdf" }),
    });
    check("piece de B pointant vers un fichier de A refusee", stolen.status >= 400, `HTTP ${stolen.status}`);
  }
  if (projectBId && requirementA) {
    const section = await asB("/rest/v1/memory_sections", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ organization_id: orgB, project_id: projectBId, position: 0, title: "B", requirement_ids: [requirementA.id] }),
    });
    const rows = await json(section);
    const kept = Array.isArray(rows) ? rows[0]?.requirement_ids ?? [] : [];
    check("chapitre de B ne peut pas referencer une exigence de A", section.status >= 400 || !kept.includes(requirementA.id), `HTTP ${section.status}, ${kept.length} reference(s)`);
  }

  const insertCompany = await asB("/rest/v1/company_references", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ organization_id: orgA, name: "fausse reference" }),
  });
  check("ajout d'une reference dans la base de A refuse", insertCompany.status >= 400, `HTTP ${insertCompany.status}`);

  // --- 3. Modification et suppression dans A -----------------------------------------
  for (const table of ["projects", "requirements", "memory_sections", "quality_issues", "company_references"]) {
    await asB(`/rest/v1/${table}?organization_id=eq.${orgA}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(table === "projects" ? { name: "modifie par B" } : table === "quality_issues" ? { resolved_at: new Date().toISOString() } : table === "requirements" ? { status: "MISSING" } : table === "memory_sections" ? { title: "modifie par B" } : { name: "modifie par B" }),
    });
    await asB(`/rest/v1/${table}?organization_id=eq.${orgA}`, { method: "DELETE" });
  }
  const [projectAfter] = await json(await service(`/rest/v1/projects?id=eq.${projectId}&select=name`));
  check("le dossier de A n'a pas ete modifie", projectAfter?.name === project.name);
  const touched = await json(await service(`/rest/v1/memory_sections?organization_id=eq.${orgA}&title=eq.modifie%20par%20B&select=id`));
  check("aucun chapitre de A modifie", Array.isArray(touched) && touched.length === 0);
  for (const table of TABLES) {
    const after = await countA(table);
    if (Number.isNaN(before[table]) && Number.isNaN(after)) continue;
    check(`volume ${table} de A inchange`, after === before[table], `${before[table]} -> ${after}`);
  }

  // --- 4. Stockage -------------------------------------------------------------------
  for (const bucket of ["dce", "entreprise", "exports"]) {
    const listed = await json(
      await asB(`/storage/v1/object/list/${bucket}`, {
        method: "POST",
        body: JSON.stringify({ prefix: `${orgA}/`, limit: 10 }),
      }),
    );
    check(`liste des fichiers ${bucket} de A`, Array.isArray(listed) ? listed.length === 0 : true, Array.isArray(listed) ? `${listed.length} fichier(s)` : "refusee");

    const upload = await fetch(`${URL_}/storage/v1/object/${bucket}/${orgA}/intrusion.txt`, {
      method: "POST",
      headers: { apikey: ANON, Authorization: `Bearer ${tokenB}`, "Content-Type": "text/plain" },
      body: "intrusion",
    });
    check(`depot d'un fichier dans ${bucket}/A refuse`, upload.status >= 400, `HTTP ${upload.status}`);
  }
  const [docA] = await json(await service(`/rest/v1/project_documents?organization_id=eq.${orgA}&select=storage_path&limit=1`));
  if (docA?.storage_path) {
    const download = await fetch(`${URL_}/storage/v1/object/authenticated/dce/${docA.storage_path}`, {
      headers: { apikey: ANON, Authorization: `Bearer ${tokenB}` },
    });
    check("telechargement d'une piece du DCE de A refuse", download.status >= 400, `HTTP ${download.status}`);
    const signed = await asB(`/storage/v1/object/sign/dce/${docA.storage_path}`, {
      method: "POST",
      body: JSON.stringify({ expiresIn: 60 }),
    });
    check("lien signe vers une piece de A refuse", signed.status >= 400, `HTTP ${signed.status}`);
  }

  // --- 5. Application : routes et pages avec la session de B --------------------------
  let appUp = false;
  try {
    appUp = (await fetch(`${APP}/login`, { redirect: "manual", signal: AbortSignal.timeout(10000) })).status < 500;
  } catch {
    appUp = false;
  }
  if (!appUp) {
    console.log(`\n(application injoignable sur ${APP} : verifications des routes ignorees)`);
  } else {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    try {
      // Session de B posee comme le fait @supabase/ssr (cookie base64url,
      // decoupe en morceaux) : la connexion demo automatique du mode local
      // ne peut donc pas s'y substituer.
      const context = await browser.newContext();
      const ref = new URL(URL_).hostname.split(".")[0];
      const encoded = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
      const chunks = encoded.match(/.{1,3180}/g);
      const { hostname } = new URL(APP);
      await context.addCookies(
        chunks.map((value, i) => ({
          name: chunks.length === 1 ? `sb-${ref}-auth-token` : `sb-${ref}-auth-token.${i}`,
          value,
          domain: hostname,
          path: "/",
        })),
      );
      const page = await context.newPage();
      await page.goto(`${APP}/app/parametres`);
      const who = await page.locator("body").innerText();
      check("B est connecte a l'application sous son propre compte", who.includes(email) || who.includes("Test isolation B"));

      const pageA = await page.goto(`${APP}/app/dossiers/${projectId}`);
      check("page du dossier de A introuvable pour B", pageA.status() === 404, `HTTP ${pageA.status()}`);
      const listText = await page.goto(`${APP}/app/dossiers`).then(() => page.locator("main").innerText());
      check("la liste des dossiers de B ne montre pas A", !listText.includes(project.name));

      for (const [route, body] of [
        ["run", { operation: "strategy" }],
        ["quality", {}],
        ["export", { format: "PDF" }],
        ["ingest", {}],
      ]) {
        const res = await context.request.post(`${APP}/api/projects/${projectId}/${route}`, { data: body });
        check(`route /api/projects/[A]/${route} refusee a B`, res.status() === 404 || res.status() === 403 || res.status() === 401, `HTTP ${res.status()}`);
      }
    } finally {
      await browser.close();
    }
  }
} catch (error) {
  check("deroulement du test", false, error instanceof Error ? error.message : String(error));
} finally {
  // --- Nettoyage ------------------------------------------------------------------------
  if (typeof orgB === "string") await service(`/rest/v1/organizations?id=eq.${orgB}`, { method: "DELETE" });
  if (userB) await service(`/auth/v1/admin/users/${userB}`, { method: "DELETE" });
  const leftover = userB ? await service(`/auth/v1/admin/users/${userB}`) : null;
  console.log(`\nNettoyage : utilisateur B ${leftover && leftover.status === 404 ? "supprime" : "a verifier"}.`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verifications reussies.`);
process.exit(failed.length === 0 ? 0 : 1);

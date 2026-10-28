// npm run rapport — script local, jamais déployé.
// PDF des réponses des invités (Reponses-Mariage.pdf, A4), à partir des
// réponses enregistrées dans Redis : même source que `npm run reponses`.
// Lecture seule : rien n'est écrit dans Redis.
//
// Listes (Maman / Papa) et doublons probables : invites.listes.json, comme
// pour `npm run pdf`. Les liens de test ne figurent nulle part.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright-core';

import { wedding } from '../src/config/wedding.ts';
import { deriver } from '../src/lib/crypto.ts';
import { nombrePlaces } from '../src/lib/invites.ts';
import { registre, toutesLesReponses } from '../src/lib/registre.ts';
import { lireLiens } from './exports-liens.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_ENV = path.join(racine, '.env.local');
const FICHIER_CODES = path.join(racine, 'invites.codes.json');
const FICHIER_LIENS = path.join(racine, 'liens.csv');
const FICHIER_LISTES = path.join(racine, 'invites.listes.json');
const FICHIER_PDF = path.join(racine, 'Reponses-Mariage.pdf');
const NOMS_TEST = new Set(['Gween Kangah', 'Hans-Berryl']);

function arreter(message) {
  console.error(message);
  process.exit(1);
}

if (existsSync(FICHIER_ENV)) process.loadEnvFile(FICHIER_ENV);
const redis = registre();
if (!redis) {
  arreter(
    'KV_REST_API_URL ou KV_REST_API_TOKEN est vide : remplissez .env.local avec les valeurs de la base Redis (page de la base dans Vercel).',
  );
}
if (!existsSync(FICHIER_CODES) || !existsSync(FICHIER_LIENS)) {
  arreter("invites.codes.json ou liens.csv introuvable : lancez d'abord `npm run liens`.");
}

const codes = JSON.parse(readFileSync(FICHIER_CODES, 'utf8'));
const { tous } = await lireLiens(FICHIER_LIENS);
const actifs = tous.map((invite) => invite.nom).filter((nom) => !NOMS_TEST.has(nom));
const listes = existsSync(FICHIER_LISTES)
  ? JSON.parse(readFileSync(FICHIER_LISTES, 'utf8'))
  : { existants: [], reactives: [], feuilles: { Maman: [], Papa: [] }, doublons: {}, remplace: {} };

// Réponses, par nom (y compris les liens désactivés, comme `npm run reponses`)
const { sel, iterations } = wedding.acces;
const enregistrees = await toutesLesReponses(redis);
const noms = Object.keys(codes);
const ids = await Promise.all(noms.map(async (nom) => (await deriver(codes[nom], sel, iterations)).id));
const nomParId = new Map(ids.map((id, i) => [id, noms[i]]));
const reponses = new Map();
for (const [id, enregistrement] of enregistrees) {
  const nom = nomParId.get(id) ?? '(lien inconnu)';
  if (!NOMS_TEST.has(nom)) reponses.set(nom, enregistrement);
}

// Liste d'origine de chaque nom
const surMaman = new Set([...listes.feuilles.Maman, ...listes.existants, ...(listes.reactives ?? [])]);
const surPapa = new Set(listes.feuilles.Papa);
const doublons = listes.doublons ?? {};
// Anciens liens individuels remplacés par un couple : ancien nom → couple
const remplacePar = new Map(
  Object.entries(listes.remplace ?? {}).flatMap(([couple, anciens]) => anciens.map((a) => [a, couple])),
);
const liste = (nom) => {
  const m = surMaman.has(nom);
  const p = surPapa.has(nom) || remplacePar.has(nom);
  return m && p ? 'Les deux' : m ? 'Maman' : p ? 'Papa' : '—';
};

// Mentions : doublon possible, ancien lien remplacé
const variantesDe = (nom) => Object.keys(doublons).filter((v) => doublons[v] === nom);
function mentions(nom, { repondu }) {
  const m = [];
  if (doublons[nom]) m.push(`doublon possible de « ${doublons[nom]} »`);
  for (const v of variantesDe(nom)) {
    if (reponses.has(v)) m.push(`doublon possible de « ${v} »${repondu ? '' : ', qui a répondu'}`);
  }
  if (remplacePar.has(nom)) m.push(`ancien lien, remplacé par « ${remplacePar.get(nom)} »`);
  return m;
}

// Tri alphabétique sur le nom, sans les civilités et titres de tête
const TETE = /^((M\.|Mme|Mlle|et|Abbé|Maître|Maitre|Commissaire|Commisaire|Dr|Doc|Maman|Nanan)\s+)+/u;
const cleTri = (nom) => nom.replace(TETE, '');
const parNom = (a, b) => cleTri(a.nom).localeCompare(cleTri(b.nom), 'fr', { sensitivity: 'base' });

const lignes = [...reponses].map(([nom, { reponse, date }]) => ({
  nom,
  reponse,
  date,
  places: nombrePlaces(nom),
  liste: liste(nom),
  mentions: mentions(nom, { repondu: true }),
}));
const presents = lignes.filter((l) => l.reponse === 'present').sort(parNom);
const absents = lignes.filter((l) => l.reponse === 'absent').sort(parNom);
const places = presents.reduce((total, l) => total + l.places, 0);

// Sans réponse : liens des listes actuelles, hors doublons possibles et
// anciens liens remplacés.
const sansReponse = actifs
  .filter((nom) => !reponses.has(nom) && !doublons[nom] && !remplacePar.has(nom))
  .filter((nom) => liste(nom) !== '—')
  .map((nom) => ({ nom, liste: liste(nom), mentions: mentions(nom, { repondu: false }) }))
  .sort(parNom);

// Dates (heure d'Abidjan)
const abidjan = (options) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Abidjan', ...options });
const dateCourte = (iso) => (iso ? abidjan({ dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) : '—');
const maintenant = new Date();
const miseAJour = `Mis à jour le ${abidjan({ day: 'numeric', month: 'long', year: 'numeric' }).format(maintenant)} à ${abidjan({ hour: '2-digit', minute: '2-digit' }).format(maintenant).replace(':', ' h ')}`;

// HTML
const echapper = (texte) =>
  String(texte).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nomHtml = ({ nom, mentions: m }) =>
  `${echapper(nom)}${m.map((x) => `<span class="mention">${echapper(x)}</span>`).join('')}`;
const vide = (texte) => `<p class="vide">${echapper(texte)}</p>`;

const tableauPresents = presents.length
  ? `<table>
    <thead><tr><th class="n">N°</th><th>Invité</th><th class="c">Places</th><th>Liste</th><th>Date de réponse</th></tr></thead>
    <tbody>${presents
      .map(
        (l, i) =>
          `<tr><td class="n">${i + 1}</td><td>${nomHtml(l)}</td><td class="c">${l.places}</td><td>${l.liste}</td><td class="date">${dateCourte(l.date)}</td></tr>`,
      )
      .join('')}</tbody>
    <tfoot><tr><td></td><td>Total des places</td><td class="c">${places}</td><td colspan="2"></td></tr></tfoot>
  </table>`
  : vide('Aucune présence confirmée pour le moment.');

const tableauAbsents = absents.length
  ? `<table>
    <thead><tr><th class="n">N°</th><th>Invité</th><th>Liste</th><th>Date de réponse</th></tr></thead>
    <tbody>${absents
      .map(
        (l, i) =>
          `<tr><td class="n">${i + 1}</td><td>${nomHtml(l)}</td><td>${l.liste}</td><td class="date">${dateCourte(l.date)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>`
  : vide('Aucune absence signalée pour le moment.');

const tableauSans = sansReponse.length
  ? `<table>
    <thead><tr><th class="n">N°</th><th>Invité</th><th>Liste</th></tr></thead>
    <tbody>${sansReponse
      .map((l, i) => `<tr><td class="n">${i + 1}</td><td>${nomHtml(l)}</td><td>${l.liste}</td></tr>`)
      .join('')}</tbody>
  </table>`
  : vide('Tous les invités ont répondu.');

const aVerifier = lignes.filter((l) => l.mentions.length).length;
const { elle, lui } = wedding.maries;
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Réponses des invités : mariage de ${echapper(elle)} &amp; ${echapper(lui)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap">
<style>
  @page {
    size: A4 portrait;
    background: #faf6f0;
    margin: 16mm 15mm 18mm;
    @bottom-center {
      content: 'Page ' counter(page) ' / ' counter(pages);
      font: 400 9pt 'Source Sans 3', Arial, sans-serif;
      color: #56634f;
    }
  }
  html { background: #faf6f0; }
  body { margin: 0; color: #2f3a2c; font: 400 10.5pt/1.4 'Source Sans 3', Arial, sans-serif; }

  .entete { text-align: center; margin-bottom: 7mm; }
  h1 { margin: 0; color: #344733; font: 700 21pt/1.2 'Cormorant Garamond', Georgia, serif; }
  .insecable { white-space: nowrap; }
  .maj { margin: 1.5mm 0 0; color: #9a7b3f; font-style: italic; }
  .filet { display: block; width: 36mm; margin: 3mm auto 0; border-top: 1.2pt solid #bf9b5a; }

  .recap {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 8mm;
    border: 1.2pt solid #bf9b5a;
    border-radius: 3mm;
    background: #eef2ea;
    break-inside: avoid;
  }
  .recap div { padding: 3.5mm 3mm; text-align: center; }
  .recap div + div { border-left: 0.6pt solid #d9bc82; }
  .chiffre { display: block; color: #344733; font: 700 22pt/1.1 'Cormorant Garamond', Georgia, serif; }
  .libelle { display: block; margin-top: 1mm; font-weight: 600; }
  .detail { display: block; color: #9a7b3f; font-size: 9.5pt; }

  h2 {
    margin: 0 0 2.5mm;
    padding-top: 2mm;
    border-top: 0.8pt solid #d9bc82;
    color: #344733;
    font: 700 16pt/1.2 'Cormorant Garamond', Georgia, serif;
    break-after: avoid;
  }
  h2 .compte { color: #9a7b3f; }
  section { margin-bottom: 8mm; }
  .intro { margin: 0 0 2.5mm; color: #56634f; font-style: italic; }

  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th {
    padding: 1.6mm 2mm;
    border-bottom: 1pt solid #bf9b5a;
    color: #9a7b3f;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-align: left;
    text-transform: uppercase;
  }
  td { padding: 1.5mm 2mm; border-bottom: 0.5pt solid #e6dcc8; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f5efe4; }
  tfoot td { border-top: 1pt solid #bf9b5a; border-bottom: 0; color: #344733; font-weight: 700; }
  .n { width: 9mm; color: #9a7b3f; text-align: right; }
  .c { width: 16mm; text-align: center; }
  .date { white-space: nowrap; }
  .mention { display: block; color: #9a7b3f; font-size: 9pt; font-style: italic; }
  .vide { margin: 0; font-style: italic; }
  .note { margin-top: 6mm; color: #56634f; font-size: 9.5pt; font-style: italic; }
</style>
</head>
<body>
  <header class="entete">
    <h1>Réponses des invités : mariage de <span class="insecable">${echapper(elle)} &amp; ${echapper(lui)}</span></h1>
    <p class="maj">${echapper(miseAJour)} (heure d'Abidjan)</p>
    <span class="filet"></span>
  </header>

  <div class="recap">
    <div><span class="chiffre">${lignes.length}</span><span class="libelle">invités ayant répondu</span></div>
    <div><span class="chiffre">${presents.length}</span><span class="libelle">présents</span><span class="detail">${places} place${places > 1 ? 's' : ''} confirmée${places > 1 ? 's' : ''}</span></div>
    <div><span class="chiffre">${absents.length}</span><span class="libelle">absents</span></div>
    <div><span class="chiffre">${sansReponse.length}</span><span class="libelle">invités sans réponse</span></div>
  </div>

  <section>
    <h2>Présences confirmées <span class="compte">(${presents.length})</span></h2>
    ${tableauPresents}
  </section>

  <section>
    <h2>Absences <span class="compte">(${absents.length})</span></h2>
    ${tableauAbsents}
  </section>

  <section>
    <h2>Sans réponse <span class="compte">(${sansReponse.length})</span></h2>
    <p class="intro">À relancer avant le lundi 9 novembre. Les doublons possibles et les anciens liens remplacés n'y figurent pas.</p>
    ${tableauSans}
  </section>

  <p class="note">${aVerifier ? `Une mention en italique signale une réponse à vérifier (doublon possible ou ancien lien) : les mêmes personnes pourraient être comptées deux fois. ` : ''}Les premières réponses, reçues par courriel, ont été enregistrées manuellement : leur date est celle de l'enregistrement.</p>
</body>
</html>`;

const nav = await chromium.launch({ channel: 'chrome' });
try {
  const page = await nav.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: FICHIER_PDF, preferCSSPageSize: true, printBackground: true, tagged: true });
} catch (erreur) {
  if (erreur.message?.includes('EBUSY') || erreur.message?.includes('EPERM')) {
    arreter('Reponses-Mariage.pdf est ouvert dans un autre programme : fermez-le puis relancez la commande.');
  }
  throw erreur;
} finally {
  await nav.close();
}

console.log(`Écrit : ${path.basename(FICHIER_PDF)}`);
console.log(`Invités ayant répondu : ${lignes.length}`);
console.log(`Présents : ${presents.length} (${places} places)`);
console.log(`Absents : ${absents.length}`);
console.log(`Sans réponse : ${sansReponse.length}`);
if (aVerifier) console.log(`Réponses à vérifier (doublon possible ou ancien lien) : ${aVerifier}`);

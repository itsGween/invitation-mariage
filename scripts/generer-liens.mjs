// npm run liens — script local, jamais déployé.
// Lit invites.csv, attribue un code à chaque invité, écrit les données
// chiffrées du site et exporte liens.csv et liens.xlsx. Le document Word
// est produit à part : `npm run document`.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { wedding } from '../src/config/wedding.ts';
import {
  ALPHABET,
  LONGUEUR_CODE,
  chiffrerNom,
  dechiffrerNom,
  deriver,
} from '../src/lib/crypto.ts';
import { ecrireXlsx } from './exports-liens.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_INVITES = path.join(racine, 'invites.csv');
const FICHIER_CODES = path.join(racine, 'invites.codes.json');
const FICHIER_LIENS = path.join(racine, 'liens.csv');
const FICHIER_XLSX = path.join(racine, 'liens.xlsx');
const FICHIER_DONNEES = path.join(racine, 'src', 'data', 'invites.json');

// Le nom est gardé tel qu'écrit dans invites.csv (accents, orthographe,
// majuscules) : seuls les espaces superflus sont retirés et les civilités de
// tête normalisées (« M. » avec son point, « Mme », « Mlle », « Abbé », « Maître », « Commissaire », « Dr », « Maman »).
// « et » et « épouse » restent en minuscule.
// « mme  Kablan » → « Mme Kablan » ; « M Et Mme Ido Serge » → « M. et Mme Ido Serge »
const CIVILITES = new Map([
  ['m', 'M.'],
  ['m.', 'M.'],
  ['mme', 'Mme'],
  ['mme.', 'Mme'],
  ['mlle', 'Mlle'],
  ['mlle.', 'Mlle'],
  ['abbé', 'Abbé'],
  ['maître', 'Maître'],
  ['commissaire', 'Commissaire'],
  ['dr', 'Dr'],
  ['maman', 'Maman'],
]);
const MINUSCULES = new Set(['et', 'épouse']);

function nettoyerNom(brut) {
  const mots = brut
    .replace(/^﻿/, '')
    .replace(/^["']+|["';,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  let enTete = true;
  return mots
    .map((mot) => {
      const bas = mot.toLocaleLowerCase('fr');
      if (enTete && CIVILITES.has(bas)) return CIVILITES.get(bas);
      if (MINUSCULES.has(bas)) return bas;
      enTete = false;
      return mot;
    })
    .join(' ');
}

// Clé de comparaison : insensible à la casse et aux accents.
function cle(nom) {
  return nom.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function nouveauCode(dejaPris) {
  for (;;) {
    let code = '';
    for (let i = 0; i < LONGUEUR_CODE; i++) code += ALPHABET[randomInt(ALPHABET.length)];
    if (!dejaPris.has(code)) return code;
  }
}

const csv = (valeur) => `"${String(valeur).replace(/"/g, '""')}"`;

async function lireJson(fichier, defaut) {
  if (!existsSync(fichier)) return defaut;
  return JSON.parse(await readFile(fichier, 'utf8'));
}

if (!existsSync(FICHIER_INVITES)) {
  console.error('invites.csv introuvable : créez-le à la racine du projet, un nom par ligne.');
  process.exit(1);
}

// 1. Noms nettoyés, sans doublons
const noms = [];
const vus = new Map();
const doublons = [];
for (const ligne of (await readFile(FICHIER_INVITES, 'utf8')).split(/\r?\n/)) {
  const nom = nettoyerNom(ligne);
  if (!nom) continue;
  const k = cle(nom);
  if (vus.has(k)) {
    doublons.push(`${nom} (déjà présent : ${vus.get(k)})`);
    continue;
  }
  vus.set(k, nom);
  noms.push(nom);
}

// 2. Codes : on garde ceux déjà attribués, y compris pour les noms retirés
//    (les remettre dans invites.csv réactive le même lien).
const codes = await lireJson(FICHIER_CODES, {});
const codeParCle = new Map(Object.entries(codes).map(([nom, code]) => [cle(nom), { nom, code }]));
const pris = new Set(Object.values(codes));
const nouveaux = [];
for (const nom of noms) {
  const connu = codeParCle.get(cle(nom));
  if (connu) {
    if (connu.nom !== nom) {
      delete codes[connu.nom];
      codes[nom] = connu.code;
    }
    continue;
  }
  const code = nouveauCode(pris);
  pris.add(code);
  codes[nom] = code;
  nouveaux.push(nom);
}
const actifs = new Set(noms);
const retires = Object.keys(codes).filter((nom) => !actifs.has(nom));

// 3. Données chiffrées : une entrée déjà valide est reprise telle quelle
//    pour que le fichier ne change pas d'une exécution à l'autre.
const anciennes = new Map((await lireJson(FICHIER_DONNEES, [])).map((e) => [e.id, e]));
const { sel, iterations } = wedding.acces;
const donnees = [];
for (const nom of noms) {
  const { id, cle: cleAes } = await deriver(codes[nom], sel, iterations);
  const ancienne = anciennes.get(id);
  let entree;
  if (ancienne) {
    const clair = await dechiffrerNom(cleAes, ancienne.iv, ancienne.nom).catch(() => null);
    if (clair === nom) entree = ancienne;
  }
  donnees.push(entree ?? { id, ...(await chiffrerNom(cleAes, nom)) });
}
// Tri par identifiant : l'ordre du fichier ne révèle pas celui de la liste.
donnees.sort((a, b) => (a.id < b.id ? -1 : 1));

// 4. Écriture
const base = wedding.site.url.replace(/\/+$/, '');
// Dans l'ordre de invites.csv
const invites = noms.map((nom) => {
  const lien = `${base}/?i=${codes[nom]}`;
  const message = wedding.site.message.replaceAll('{nom}', nom).replaceAll('{lien}', lien);
  return { nom, lien, message };
});
const lignes = [
  ['nom', 'lien', 'message'].map(csv).join(';'),
  ...invites.map(({ nom, lien, message }) => [nom, lien, message].map(csv).join(';')),
];

await writeFile(FICHIER_DONNEES, JSON.stringify(donnees, null, 2) + '\n');
await writeFile(FICHIER_CODES, JSON.stringify(codes, null, 2) + '\n');
// BOM + point-virgule : s'ouvre directement dans Excel en français.
await writeFile(FICHIER_LIENS, '﻿' + lignes.join('\r\n') + '\r\n');

// Excel, régénéré à chaque exécution. Un fichier resté ouvert dans Excel
// est verrouillé : on le signale sans interrompre le reste.
const exportsEcrits = ['liens.csv'];
try {
  await ecrireXlsx(FICHIER_XLSX, invites);
  exportsEcrits.push('liens.xlsx');
} catch (erreur) {
  if (erreur.code !== 'EBUSY' && erreur.code !== 'EPERM') throw erreur;
  console.warn("  ! liens.xlsx n'a pas pu être mis à jour : fermez-le puis relancez la commande.");
}

console.log(`${noms.length} invité(s) actif(s), dont ${nouveaux.length} nouveau(x).`);
for (const nom of nouveaux) console.log(`  + ${nom}`);
if (retires.length) {
  console.log(`${retires.length} lien(s) désactivé(s) (nom absent de invites.csv) :`);
  for (const nom of retires) console.log(`  - ${nom}`);
}
if (doublons.length) {
  console.warn(`${doublons.length} doublon(s) ignoré(s) :`);
  for (const d of doublons) console.warn(`  ! ${d}`);
}
console.log(`Écrit : src/data/invites.json, invites.codes.json, ${exportsEcrits.join(', ')}`);

// Administration des réponses enregistrées (Redis) — script local, jamais
// déployé. Lit KV_REST_API_URL et KV_REST_API_TOKEN dans .env.local, et la
// correspondance nom / code dans invites.codes.json (noms actifs : liens.csv).
//
//   npm run reponses                                 liste et totaux
//   npm run reponse -- "Nom exact" present|absent    enregistre sans courriel
//   npm run reinitialiser -- "Nom exact"             efface la réponse

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { wedding } from '../src/config/wedding.ts';
import { deriver } from '../src/lib/crypto.ts';
import { nombrePlaces } from '../src/lib/invites.ts';
import {
  effacerReponse,
  enregistrerReponse,
  lireReponse,
  registre,
  toutesLesReponses,
} from '../src/lib/registre.ts';
import { lireLiens } from './exports-liens.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_ENV = path.join(racine, '.env.local');
const FICHIER_CODES = path.join(racine, 'invites.codes.json');
const FICHIER_LIENS = path.join(racine, 'liens.csv');
// Liens de test : listés, mais jamais comptés dans les totaux.
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
const actifs = tous.map((invite) => invite.nom);
const { sel, iterations } = wedding.acces;
const idDe = async (nom) => (await deriver(codes[nom], sel, iterations)).id;

function inviteExact(nom) {
  if (!nom) arreter('Indiquez le nom exact de l’invité, entre guillemets.');
  if (!actifs.includes(nom) || !codes[nom]) {
    arreter(`Aucun invité ne s'appelle exactement « ${nom} » : rien n'a été modifié.`);
  }
  return nom;
}

const libelle = (reponse) => (reponse === 'present' ? 'présent' : 'absent');
const dateLisible = (iso) =>
  iso
    ? new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Abidjan',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(iso))
    : '';

const [commande, nomBrut, reponseBrute] = process.argv.slice(2);

if (commande === 'enregistrer') {
  const nom = inviteExact(nomBrut);
  if (reponseBrute !== 'present' && reponseBrute !== 'absent') {
    arreter('Réponse attendue : present ou absent.');
  }
  const existante = await enregistrerReponse(redis, await idDe(nom), reponseBrute);
  if (existante) {
    console.log(
      `${nom} : réponse déjà enregistrée (${libelle(existante.reponse)}, ${dateLisible(existante.date)}), inchangée. Pour la remplacer : npm run reinitialiser -- "${nom}", puis recommencez.`,
    );
  } else {
    console.log(`${nom} : ${libelle(reponseBrute)}, enregistré (aucun courriel envoyé).`);
  }
} else if (commande === 'reinitialiser') {
  const nom = inviteExact(nomBrut);
  const id = await idDe(nom);
  const existante = await lireReponse(redis, id);
  if (await effacerReponse(redis, id)) {
    console.log(`${nom} : réponse effacée (${libelle(existante?.reponse)}). Le lien peut répondre à nouveau.`);
  } else {
    console.log(`${nom} : aucune réponse enregistrée, rien à effacer.`);
  }
} else if (commande === 'liste') {
  const reponses = await toutesLesReponses(redis);
  // Identifiants de tous les noms connus, y compris les liens désactivés.
  const noms = Object.keys(codes);
  const ids = await Promise.all(noms.map(idDe));
  const nomParId = new Map(ids.map((id, i) => [id, noms[i]]));
  const ordre = new Map(actifs.map((nom, i) => [nom, i]));

  const lignes = [...reponses].map(([id, { reponse, date }]) => ({
    nom: nomParId.get(id) ?? '(lien inconnu)',
    reponse,
    date,
  }));
  lignes.sort((a, b) => (ordre.get(a.nom) ?? 1e9) - (ordre.get(b.nom) ?? 1e9));

  const largeur = Math.max(3, ...lignes.map((l) => l.nom.length));
  console.log(`${'Nom'.padEnd(largeur)}  Réponse  Date (Abidjan)`);
  for (const { nom, reponse, date } of lignes) {
    console.log(`${nom.padEnd(largeur)}  ${libelle(reponse).padEnd(7)}  ${dateLisible(date)}`);
  }

  const invites = lignes.filter((l) => !NOMS_TEST.has(l.nom));
  const presents = invites.filter((l) => l.reponse === 'present');
  const places = presents.reduce((total, l) => total + nombrePlaces(l.nom), 0);
  const nombreInvites = actifs.filter((nom) => !NOMS_TEST.has(nom)).length;
  console.log('');
  console.log(`Invités ayant répondu : ${invites.length} sur ${nombreInvites}`);
  console.log(`Présents : ${presents.length}`);
  console.log(`Absents : ${invites.length - presents.length}`);
  console.log(`Places confirmées : ${places}`);
  const tests = lignes.length - invites.length;
  if (tests) console.log(`(${tests} réponse(s) de lien de test, non comptée(s) : ${[...NOMS_TEST].join(', ')})`);
} else {
  arreter('Commande inconnue. Utilisez npm run reponses, npm run reponse ou npm run reinitialiser.');
}

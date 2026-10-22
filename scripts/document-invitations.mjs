// npm run document — script local, jamais déployé.
// À partir de liens.csv (produit par `npm run liens`), écrit le document Word
// Invitations-Mariage-Marie-Christelle-Patrice.docx : mode d'emploi, lien
// d'aperçu, puis un message prêt à envoyer par invité, dans l'ordre de
// invites.csv. Régénère aussi liens.xlsx.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { wedding } from '../src/config/wedding.ts';
import { ecrireDocument, ecrireXlsx } from './exports-liens.mjs';

// Nom dont le lien sert d'aperçu : présenté à part, hors de la liste.
const NOM_APERCU = 'Gween Kangah';
// Adresse citée dans le mode d'emploi : celle qui reçoit les réponses.
const DESTINATAIRE = process.env.RSVP_DESTINATAIRE || 'kangahhansberryl@gmail.com';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_LIENS = path.join(racine, 'liens.csv');
const FICHIER_DOCX = path.join(racine, 'Invitations-Mariage-Marie-Christelle-Patrice.docx');
const FICHIER_XLSX = path.join(racine, 'liens.xlsx');

if (!existsSync(FICHIER_LIENS)) {
  console.error("liens.csv introuvable : lancez d'abord `npm run liens`.");
  process.exit(1);
}

// CSV « ; » entre guillemets, tel qu'écrit par generer-liens.mjs
function lireCsv(contenu) {
  const lignes = [];
  let ligne = [];
  let champ = '';
  let entreGuillemets = false;
  for (let i = 0; i < contenu.length; i++) {
    const c = contenu[i];
    if (entreGuillemets) {
      if (c === '"' && contenu[i + 1] === '"') {
        champ += '"';
        i++;
      } else if (c === '"') entreGuillemets = false;
      else champ += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === ';') {
      ligne.push(champ);
      champ = '';
    } else if (c === '\n') {
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = '';
    } else if (c !== '\r') champ += c;
  }
  if (champ || ligne.length) lignes.push([...ligne, champ]);
  return lignes;
}

const [, ...lignes] = lireCsv((await readFile(FICHIER_LIENS, 'utf8')).replace(/^﻿/, ''));
const tous = lignes.filter((l) => l[0]).map(([nom, lien, message]) => ({ nom, lien, message }));
const apercu = tous.find((invite) => invite.nom === NOM_APERCU) ?? null;
const invites = tous.filter((invite) => invite !== apercu);

const titre = `Invitations : mariage de ${wedding.maries.elle} & ${wedding.maries.lui}`;
await ecrireDocument(FICHIER_DOCX, invites, { titre, apercu, destinataire: DESTINATAIRE });
await ecrireXlsx(FICHIER_XLSX, tous);
console.log(
  `Écrit : ${path.basename(FICHIER_DOCX)} (${invites.length} invités${apercu ? " + lien d'aperçu" : ''}), liens.xlsx`,
);

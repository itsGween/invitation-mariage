// Exports Excel et Word de la liste des liens (generer-liens.mjs,
// document-invitations.mjs).
// `invites` : [{ nom, lien, message }], dans l'ordre de invites.csv.

import { readFile, writeFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  TextRun,
} from 'docx';

const VERT = '56634F';
const OR = '9A7B3F';
const GRIS = '6B7566';
const BLEU_LIEN = '1F5F8B';

export async function ecrireXlsx(fichier, invites) {
  const classeur = new ExcelJS.Workbook();
  // Ligne d'en-tête figée
  const feuille = classeur.addWorksheet('Liens', { views: [{ state: 'frozen', ySplit: 1 }] });
  feuille.columns = [
    { header: 'Nom', key: 'nom', width: 34 },
    { header: 'Lien', key: 'lien', width: 56 },
    { header: 'Message à envoyer', key: 'message', width: 70 },
    { header: 'Envoyé', key: 'envoye', width: 11 },
  ];

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  entete.alignment = { vertical: 'middle' };
  entete.height = 22;
  entete.eachCell((cellule) => {
    cellule.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VERT}` } };
  });

  for (const { nom, lien, message } of invites) {
    const ligne = feuille.addRow({ nom, lien: { text: lien, hyperlink: lien }, message, envoye: '' });
    ligne.alignment = { vertical: 'top' };
    ligne.getCell('nom').font = { bold: true };
    ligne.getCell('lien').font = { color: { argb: `FF${BLEU_LIEN}` }, underline: true };
    ligne.getCell('message').alignment = { vertical: 'top', wrapText: true };
    ligne.getCell('envoye').alignment = { vertical: 'top', horizontal: 'center' };
  }
  feuille.autoFilter = { from: 'A1', to: 'D1' };

  await writeFile(fichier, Buffer.from(await classeur.xlsx.writeBuffer()));
}


// Document Word pensé pour être lu sur téléphone : pas de tableau, police
// de 13 pt, un encadré teinté par message.
// `apercu` : { lien } du lien d'aperçu, présenté hors de la liste, ou null.
export async function ecrireDocument(fichier, invites, { titre, apercu, destinataire }) {
  const TAILLE = 26; // demi-points : 13 pt
  const texte = (t, options = {}) => new TextRun({ text: t, size: TAILLE, color: '333B30', ...options });
  const lien = (url) =>
    new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text: url, size: TAILLE, color: BLEU_LIEN, underline: {} })],
    });
  const encadre = (enfants, { fond = 'F6F0E4', bord = 'D9BC82', avant = 120, apres = 160 } = {}) =>
    new Paragraph({
      spacing: { before: avant, after: apres, line: 320 },
      shading: { type: ShadingType.CLEAR, fill: fond, color: 'auto' },
      border: Object.fromEntries(
        ['top', 'bottom', 'left', 'right'].map((cote) => [
          cote,
          { style: BorderStyle.SINGLE, size: 6, color: bord, space: 8 },
        ]),
      ),
      indent: { left: 160, right: 160 },
      children: enfants,
    });
  // Message complet, avec son lien cliquable
  const message = ({ message: m, lien: url }) => {
    const i = m.indexOf(url);
    return i === -1 ? [texte(m)] : [texte(m.slice(0, i)), lien(url), texte(m.slice(i + url.length))];
  };
  const puce = (t) =>
    new Paragraph({ bullet: { level: 0 }, spacing: { after: 100, line: 300 }, children: [texte(t)] });
  const intertitre = (t, avant = 360) =>
    new Paragraph({
      spacing: { before: avant, after: 100 },
      children: [new TextRun({ text: t, bold: true, size: 28, color: OR })],
    });

  const consignes = [
    "Pour chaque invité ci-dessous, copiez le message de l'encadré et envoyez-le par WhatsApp.",
    "Chaque lien est personnel : il affiche le nom de l'invité sur l'invitation.",
    'Cochez « Envoyé » au fur et à mesure.',
    `Les invités confirment leur présence directement depuis l'invitation, et chaque réponse arrive automatiquement par courriel à ${destinataire}.`,
  ];

  const fiches = invites.flatMap((invite, i) => [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      spacing: { before: 480, after: 80 },
      children: [new TextRun({ text: `${i + 1}. ${invite.nom}`, bold: true, size: 30, color: VERT })],
    }),
    encadre(message(invite), { avant: 80, apres: 120 }),
    new Paragraph({
      spacing: { after: 120 },
      children: [texte('☐ Envoyé', { color: VERT, bold: true })],
    }),
  ]);

  const document = new Document({
    title: titre,
    styles: { default: { document: { run: { font: 'Calibri', size: TAILLE } } } },
    sections: [
      {
        properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Chaque lien est personnel · page ', size: 18, color: GRIS }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRIS }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            children: [new TextRun({ text: titre, bold: true, size: 40, color: VERT })],
          }),
          intertitre("Mode d'emploi", 120),
          ...consignes.map(puce),
          ...(apercu
            ? [
                intertitre("Votre lien d'aperçu"),
                encadre(
                  [
                    texte("Pour voir l'invitation comme les invités : "),
                    lien(apercu.lien),
                    new TextRun({ break: 2 }),
                    texte(
                      "N'utilisez pas les boutons de confirmation sur ce lien : ils enverraient une vraie réponse.",
                      { italics: true },
                    ),
                  ],
                  { fond: 'EEF2EA', bord: '6F8A63' },
                ),
              ]
            : []),
          intertitre(`Les invités (${invites.length})`),
          ...fiches,
        ],
      },
    ],
  });

  await writeFile(fichier, await Packer.toBuffer(document));
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

// Lit liens.csv : le lien d'aperçu (nomApercu) est mis à part, les autres
// invités restent dans l'ordre de invites.csv.
export async function lireLiens(fichier, nomApercu) {
  const [, ...lignes] = lireCsv((await readFile(fichier, 'utf8')).replace(/^﻿/, ''));
  const tous = lignes.filter((l) => l[0]).map(([nom, lien, message]) => ({ nom, lien, message }));
  const apercu = tous.find((invite) => invite.nom === nomApercu) ?? null;
  return { apercu, invites: tous.filter((invite) => invite !== apercu), tous };
}

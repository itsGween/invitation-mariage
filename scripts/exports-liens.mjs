// Exports Excel et Word de la liste des liens, utilisés par generer-liens.mjs.
// `invites` : [{ nom, lien, message }], dans l'ordre de invites.csv.

import { writeFile } from 'node:fs/promises';
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

export async function ecrireDocx(fichier, invites, titre) {
  const blocs = invites.flatMap(({ nom, lien, message }) => [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      spacing: { before: 420, after: 100 },
      children: [new TextRun({ text: nom, bold: true, size: 28, color: VERT })],
    }),
    new Paragraph({
      keepNext: true,
      spacing: { after: 100 },
      children: [
        new ExternalHyperlink({
          link: lien,
          children: [new TextRun({ text: lien, size: 21, color: BLEU_LIEN, underline: {} })],
        }),
      ],
    }),
    new Paragraph({
      keepLines: true,
      spacing: { after: 80, line: 300 },
      indent: { left: 240 },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'BF9B5A', space: 10 } },
      children: [new TextRun({ text: message, size: 22, color: '3B4437' })],
    }),
  ]);

  const document = new Document({
    title: titre,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1200, bottom: 1200, left: 1300, right: 1300 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Chaque lien est personnel · page ', size: 16, color: GRIS }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 60 },
            children: [new TextRun({ text: "Liens d'invitation", bold: true, size: 40, color: VERT })],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: titre, size: 24, color: OR })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'BF9B5A', space: 8 } },
            children: [
              new TextRun({
                text: `${invites.length} invitations. Pour chaque invité : son lien, puis le message prêt à copier.`,
                size: 20,
                color: GRIS,
              }),
            ],
          }),
          ...blocs,
        ],
      },
    ],
  });

  await writeFile(fichier, await Packer.toBuffer(document));
}

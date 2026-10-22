// npm run pdf — script local, jamais déployé.
// À partir de liens.csv (produit par `npm run liens`), écrit le PDF
// Invitations-Mariage-Marie-Christelle-Patrice.pdf (A5, à lire sur téléphone) :
// mode d'emploi, lien d'aperçu, puis un message prêt à envoyer par invité,
// dans l'ordre de invites.csv. La page HTML est imprimée par Chrome
// (Playwright). Régénère aussi liens.xlsx.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { wedding } from '../src/config/wedding.ts';
import { ecrireXlsx, lireLiens } from './exports-liens.mjs';

// Nom dont le lien sert d'aperçu : présenté à part, hors de la liste.
const NOM_APERCU = 'Gween Kangah';
// Adresse citée dans le mode d'emploi : celle qui reçoit les réponses.
const DESTINATAIRE = process.env.RSVP_DESTINATAIRE || 'kangahhansberryl7@outlook.com';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_LIENS = path.join(racine, 'liens.csv');
const FICHIER_PDF = path.join(racine, 'Invitations-Mariage-Marie-Christelle-Patrice.pdf');
const FICHIER_XLSX = path.join(racine, 'liens.xlsx');

if (!existsSync(FICHIER_LIENS)) {
  console.error("liens.csv introuvable : lancez d'abord `npm run liens`.");
  process.exit(1);
}

const { apercu, invites, tous } = await lireLiens(FICHIER_LIENS, NOM_APERCU);
const { elle, lui } = wedding.maries;
const titre = `Invitations : mariage de ${elle} & ${lui}`;

const echapper = (texte) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const lienHtml = (url) => `<a href="${echapper(url)}">${echapper(url)}</a>`;

// Le lien contenu dans le message devient cliquable.
const messageHtml = ({ message, lien }) =>
  message.split(lien).map(echapper).join(lienHtml(lien));

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${echapper(titre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Great+Vibes&display=swap">
<style>
  @page {
    size: A5 portrait;
    background: #faf6f0;
    margin: 13mm 11mm 15mm;
    @bottom-center {
      content: 'Page ' counter(page) ' / ' counter(pages);
      font: 500 10pt 'Cormorant Garamond', Georgia, serif;
      color: #56634f;
    }
  }
  html { background: #faf6f0; }
  body {
    margin: 0;
    color: #2f3a2c;
    font: 500 13pt/1.42 'Cormorant Garamond', Georgia, serif;
  }
  a { color: #2f5a8a; overflow-wrap: anywhere; }
  .case { font-family: 'Segoe UI Symbol', 'DejaVu Sans', sans-serif; }

  .entete { text-align: center; margin-bottom: 5mm; }
  .monogramme { margin: 0; padding-top: 2mm; color: #bf9b5a; font: 30pt/1 'Great Vibes', cursive; }
  h1 { margin: 2mm 0 0; color: #344733; font-size: 19pt; font-weight: 700; line-height: 1.2; }
  .insecable { white-space: nowrap; }
  .filet { display: block; width: 32mm; margin: 3mm auto 0; border-top: 1.2pt solid #bf9b5a; }

  h2 { margin: 0 0 2mm; color: #344733; font-size: 15pt; font-weight: 700; line-height: 1.2; }
  .mode ol { margin: 0; padding-left: 6mm; }
  .mode li { margin-bottom: 1.2mm; }
  .mode li::marker { color: #9a7b3f; font-weight: 700; }

  .apercu {
    margin: 5mm 0 6mm;
    padding: 3.5mm 4mm;
    border: 1.2pt solid #bf9b5a;
    border-radius: 3mm;
    background: #eef2ea;
    break-inside: avoid;
  }
  .apercu p { margin: 1.5mm 0 0; }
  .attention { color: #6b3a35; font-weight: 600; }

  .section-titre {
    break-before: page;
    margin: 0 0 4mm;
    padding-top: 2mm;
    border-top: 0.8pt solid #d9bc82;
    color: #9a7b3f;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    text-transform: uppercase;
  }
  .invite { margin-bottom: 5mm; break-inside: avoid; }
  .invite h3 { margin: 0 0 1.5mm; color: #344733; font-size: 15pt; font-weight: 700; line-height: 1.2; }
  .invite h3 .numero { color: #9a7b3f; }
  .message {
    margin: 0;
    padding: 3mm 3.5mm;
    border-left: 2pt solid #bf9b5a;
    border-radius: 1.5mm;
    background: #f3ead8;
  }
  .envoye { margin: 1.8mm 0 0; color: #344733; font-weight: 700; }
</style>
</head>
<body>
  <header class="entete">
    <p class="monogramme">${echapper(wedding.maries.monogramme)}</p>
    <h1>Invitations : mariage de <span class="insecable">${echapper(elle)} &amp; ${echapper(lui)}</span></h1>
    <span class="filet"></span>
  </header>

  <section class="mode">
    <h2>Mode d'emploi</h2>
    <ol>
      <li>Pour chaque invité, copiez son message et envoyez-le-lui par WhatsApp.</li>
      <li>Chaque lien est personnel : il affiche le nom de l'invité sur l'invitation.</li>
      <li>Cochez « Envoyé » au fur et à mesure.</li>
      <li>Les invités confirment leur présence depuis l'invitation. Chaque réponse arrive automatiquement par courriel à ${echapper(DESTINATAIRE)}.</li>
    </ol>
  </section>

  ${
    apercu
      ? `<section class="apercu">
    <h2>Votre lien d'aperçu</h2>
    <p>Pour voir l'invitation telle que vos invités la verront :<br>${lienHtml(apercu.lien)}</p>
    <p class="attention">N'utilisez pas les boutons de confirmation sur ce lien : ce nom n'apparaît pas dans la liste des invités.</p>
  </section>`
      : ''
  }

  <p class="section-titre">Les invités (${invites.length})</p>
  ${invites
    .map(
      (invite, i) => `<section class="invite">
    <h3><span class="numero">${i + 1}.</span> ${echapper(invite.nom)}</h3>
    <p class="message">${messageHtml(invite)}</p>
    <p class="envoye"><span class="case">☐</span> Envoyé</p>
  </section>`,
    )
    .join('\n  ')}
</body>
</html>`;

const nav = await chromium.launch({ channel: 'chrome' });
try {
  const page = await nav.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: FICHIER_PDF, preferCSSPageSize: true, printBackground: true, tagged: true });
} finally {
  await nav.close();
}
await ecrireXlsx(FICHIER_XLSX, tous);
console.log(
  `Écrit : ${path.basename(FICHIER_PDF)} (${invites.length} invités${apercu ? " + lien d'aperçu" : ''}), liens.xlsx`,
);

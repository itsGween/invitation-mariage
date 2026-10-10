// Génère public/apercu.jpg (1200 × 630), l'image d'aperçu WhatsApp / Open Graph.
// Elle ne contient aucun nom d'invité. À relancer si les prénoms ou la date
// changent : `npm run dev` dans un terminal, puis `npm run apercu` dans un autre.
import { chromium } from 'playwright-core';
import { wedding } from '../src/config/wedding.ts';

const base = process.env.URL_SITE ?? 'http://localhost:5173';
const illustration = (nom) => `${base}/src/assets/illustrations/${nom}.webp`;
const date = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${wedding.date}T00:00:00Z`));

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Pinyon+Script&display=block">
<style>
  body { margin: 0; width: 1200px; height: 630px; position: relative; overflow: hidden;
    background: #FAF6F0; color: #56634F; font-family: 'Cormorant Garamond', serif;
    display: grid; place-items: center; text-align: center;
    font-variant-numeric: lining-nums; }
  img { position: absolute; }
  .haut { top: -50px; left: -60px; width: 440px; }
  .bas { bottom: -50px; right: -60px; width: 440px; }
  .cadre { position: absolute; inset: 28px; border: 1.500px solid #BF9B5A; }
  h1 { margin: 0; font: 400 104px/1.05 'Pinyon Script', cursive; }
  .et { font-size: 72px; }
  p { margin: 26px 0 0; font-size: 30px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; }
  .invitation { margin: 0 0 14px; font-size: 26px; color: #9A7B3F; }
</style></head>
<body>
  <div class="cadre"></div>
  <img class="haut" src="${illustration('bouquet-haut-gauche')}" alt="">
  <img class="bas" src="${illustration('bouquet-bas-droite')}" alt="">
  <div>
    <p class="invitation">Invitation</p>
    <h1>${wedding.maries.elle} <span class="et">&amp;</span> ${wedding.maries.lui}</h1>
    <p>${date}</p>
  </div>
</body></html>`;

const navigateur = await chromium.launch({ channel: process.env.NAVIGATEUR ?? 'chrome' });
const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/apercu.jpg', type: 'jpeg', quality: 86 });
await navigateur.close();
console.log('Écrit : public/apercu.jpg');

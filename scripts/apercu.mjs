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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Great+Vibes&family=Pinyon+Script&display=block">
<style>
  body { margin: 0; width: 1200px; height: 630px; position: relative; overflow: hidden;
    background: #FAF6F0; color: #56634F; font-family: 'Cormorant Garamond', serif;
    display: flex; align-items: center; justify-content: center; gap: 56px;
    font-variant-numeric: lining-nums; }
  .decor { position: absolute; width: 340px; }
  .haut { top: -90px; left: -100px; }
  .bas { bottom: -90px; right: -100px; }
  .couple { position: relative; height: 560px; }
  .texte { position: relative; text-align: center; }
  h1 { margin: 0; font: 400 96px/1.08 'Pinyon Script', cursive; }
  h1 > span { display: block; }
  .et { font-family: 'Great Vibes', cursive; font-size: 0.92em; }
  p { margin: 30px 0 0; font-size: 28px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; }
  .invitation { margin: 0 0 18px; font-size: 24px; color: #9A7B3F; }
</style></head>
<body>
  <img class="decor haut" src="${illustration('bouquet-haut-gauche')}" alt="">
  <img class="decor bas" src="${illustration('bouquet-bas-droite')}" alt="">
  <img class="couple" src="${illustration('couple-arche')}" alt="">
  <div class="texte">
    <p class="invitation">Invitation</p>
    <h1><span>${wedding.maries.elle}</span><span><span class="et">&amp;</span> ${wedding.maries.lui}</span></h1>
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

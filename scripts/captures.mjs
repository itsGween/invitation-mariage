// Captures de contrôle à 390 px et 1440 px (serveur de dev lancé).
// Usage : node scripts/captures.mjs <nom> "<query>" [--clic "<texte du bouton>"] [--attente <ms>]
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const [nom = 'page', query = '', ...options] = process.argv.slice(2);
const option = (cle) => {
  const i = options.indexOf(cle);
  return i === -1 ? null : options[i + 1];
};
const base = process.env.URL_SITE ?? 'http://localhost:5173';
const clic = option('--clic');
const attente = Number(option('--attente') ?? 0);
const reduit = options.includes('--reduit');

await mkdir('captures', { recursive: true });
const navigateur = await chromium.launch({ channel: process.env.NAVIGATEUR ?? 'chrome' });
for (const [largeur, hauteur] of [
  [390, 844],
  [1440, 900],
]) {
  const page = await navigateur.newPage({
    viewport: { width: largeur, height: hauteur },
    deviceScaleFactor: largeur < 500 ? 2 : 1,
    reducedMotion: reduit ? 'reduce' : 'no-preference',
  });
  page.on('console', (m) => m.type() === 'error' && console.error(`[console ${largeur}]`, m.text()));
  page.on('pageerror', (e) => console.error(`[erreur ${largeur}]`, e.message));
  await page.goto(`${base}/${query}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (clic) await page.getByRole('button', { name: clic }).click();
  await page.waitForTimeout(400 + attente);
  await page.screenshot({ path: `captures/${nom}-${largeur}.png`, fullPage: true });
  const deborde = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  console.log(`captures/${nom}-${largeur}.png${deborde ? '  ⚠ défilement horizontal' : ''}`);
  await page.close();
}
await navigateur.close();

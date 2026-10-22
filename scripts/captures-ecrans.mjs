// Captures de contrôle de tous les écrans (serveur de dev lancé), y compris
// les états de la confirmation (envoi, merci, échec : simulés en dev).
// Usage : node scripts/captures-ecrans.mjs <dossier> [accueil,bureau,…]
// Le code utilisé est le premier de invites.codes.json (ou la variable CODE).
import { chromium } from 'playwright-core';
import { mkdir, readFile } from 'node:fs/promises';
const [sortie, filtre = ''] = process.argv.slice(2);
await mkdir(sortie, { recursive: true });
const base = 'http://localhost:5173/';
const CODE = process.env.CODE ?? Object.values(JSON.parse(await readFile('invites.codes.json', 'utf8')))[0];
const nav = await chromium.launch({ channel: 'chrome' });
async function page(l, h, dpr = 2) {
  const p = await nav.newPage({ viewport: { width: l, height: h }, deviceScaleFactor: dpr });
  p.on('pageerror', (e) => console.error('[erreur]', e.message));
  p.on('console', (m) => m.type() === 'error' && console.error('[console]', m.text()));
  return p;
}
async function aller(p, q) {
  await p.goto(base + q, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
}
async function deborde(p, nom) {
  const d = await p.evaluate(() => ({ h: document.documentElement.scrollWidth > innerWidth, v: document.documentElement.scrollHeight > innerHeight }));
  console.log(nom, d.h ? '⚠ défilement horizontal' : '', d.v ? '(défile verticalement)' : '(tient dans l\'écran)');
}
const shot = (p, nom, opts = {}) => p.screenshot({ path: `${sortie}/${nom}.png`, ...opts });
const etapes = {
  async accueil() { const p = await page(390, 844); await aller(p, `?i=${CODE}`); await p.waitForTimeout(800); await shot(p, '01-accueil-390'); await deborde(p, 'accueil 390'); await p.close(); },
  async accueil360() { const p = await page(360, 640); await aller(p, `?i=${CODE}`); await p.waitForTimeout(800); await shot(p, '02-accueil-360x640'); await deborde(p, 'accueil 360×640'); await p.close(); },
  async ouverture() { const p = await page(390, 844); await aller(p, `?i=${CODE}`); await p.waitForTimeout(800); await p.getByRole('button', { name: /Ouvrir/ }).click(); await p.waitForTimeout(1350); await shot(p, '03-ouverture-390'); await p.waitForTimeout(1500); await shot(p, '04-apres-ouverture-390'); await p.close(); },
  async invitation() {
    for (const d of ['A', 'B']) { const p = await page(390, 844); await aller(p, `?i=${CODE}&ecran=invitation&direction=${d}`); await p.waitForTimeout(1800); await shot(p, `05-invitation-${d}-390`); await shot(p, `06-page-complete-${d}-390`, { fullPage: true }); await deborde(p, 'invitation ' + d); await p.close(); }
  },
  async programme() { const p = await page(390, 844); await aller(p, `?i=${CODE}&ecran=invitation`); await p.locator('#programme').screenshot({ path: `${sortie}/07-programme-390.png` }); await p.close(); },
  async confirmation() {
    const p = await page(390, 844); await aller(p, `?i=${CODE}&ecran=invitation`);
    const s = p.locator('#confirmation'); await s.screenshot({ path: `${sortie}/08-confirmation-choix-390.png` });
    await p.getByRole('button', { name: 'Je confirme ma présence' }).click(); await p.waitForTimeout(1300);
    await s.screenshot({ path: `${sortie}/10-confirmation-merci-present-390.png` });
    await aller(p, `?i=${CODE}&ecran=invitation`); await s.screenshot({ path: `${sortie}/12-confirmation-rappel-390.png` });
    await p.getByRole('button', { name: 'Modifier ma réponse' }).click();
    await p.getByRole('button', { name: /Je regrette/ }).click(); await p.waitForTimeout(1300);
    await s.screenshot({ path: `${sortie}/11-confirmation-merci-absent-390.png` });
    await p.evaluate(() => localStorage.clear());
    await aller(p, `?i=${CODE}&ecran=invitation&rsvp=lent`); await p.getByRole('button', { name: 'Je confirme ma présence' }).click(); await p.waitForTimeout(200);
    await s.screenshot({ path: `${sortie}/09-confirmation-envoi-390.png` });
    await aller(p, `?i=${CODE}&ecran=invitation&rsvp=echec`); await p.getByRole('button', { name: 'Je confirme ma présence' }).click(); await p.waitForTimeout(1300);
    await s.screenshot({ path: `${sortie}/13-confirmation-echec-390.png` });
    await p.evaluate(() => localStorage.clear()); await p.close();
  },
  async invalide() { const p = await page(390, 844); await aller(p, '?i=K7ADJX9S'); await p.waitForTimeout(1200); await shot(p, '14-lien-invalide-ancien-code-390'); await p.close(); },
  async bureau() {
    for (const [l, h] of [[1440, 900], [1024, 768]]) {
      const p = await page(l, h, 1); await aller(p, `?i=${CODE}`); await p.waitForTimeout(800); await shot(p, `15-accueil-${l}`);
      await p.getByRole('button', { name: /Ouvrir/ }).click(); await p.waitForTimeout(2600);
      await shot(p, `16-page-complete-${l}`, { fullPage: true }); await deborde(p, 'bureau ' + l); await p.close();
    }
  },
};
for (const [nom, f] of Object.entries(etapes)) if (!filtre || filtre.split(',').includes(nom)) await f();
await nav.close();

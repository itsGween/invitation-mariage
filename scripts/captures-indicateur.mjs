// Captures de contrôle de l'indicateur de défilement (serveur de dev lancé).
// Usage : node scripts/captures-indicateur.mjs "<nom de l'invité>" <préfixe> [largeur] [hauteur]
// Passe par l'enveloppe, comme un invité : accueil → ouverture → invitation.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';

const [nom, prefixe, largeur = '390', hauteur = '844', direction = ''] = process.argv.slice(2);
const code = JSON.parse(readFileSync('invites.codes.json', 'utf8'))[nom];
if (!code) throw new Error(`Aucun code pour « ${nom} »`);
const base = process.env.URL_SITE ?? 'http://localhost:5173';
mkdirSync('captures', { recursive: true });

const navigateur = await chromium.launch({ channel: process.env.NAVIGATEUR ?? 'chrome' });
const page = await navigateur.newPage({
  viewport: { width: Number(largeur), height: Number(hauteur) },
  deviceScaleFactor: 2,
});
page.on('pageerror', (e) => console.error('[erreur]', e.message));
await page.goto(`${base}/?i=${code}${direction ? `&direction=${direction}` : ''}`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Ouvrir mon invitation' }).click();
await page.locator('#invitation').waitFor();

const lien = page.getByRole('link', { name: 'Voir les détails' });
const etat = async () =>
  page.evaluate(() => {
    const a = document.querySelector('.indicateur__lien');
    const s = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return { opacite: Number(s.opacity).toFixed(2), visible: s.visibility, haut: Math.round(r.top), bas: Math.round(r.bottom), gauche: Math.round(r.left), droite: Math.round(r.right), ecran: innerHeight };
  });

await page.waitForTimeout(1000);
console.log('1,0 s après la fin de l’ouverture :', await etat());
await page.waitForTimeout(1400);
console.log('2,4 s :', await etat());
await page.screenshot({ path: `captures/${prefixe}-visible.png` });
const boite = await page.locator('.indicateur__lien').boundingBox();
await page.screenshot({
  path: `captures/${prefixe}-zoom.png`,
  clip: { x: 0, y: Math.max(0, Number(hauteur) - 190), width: Number(largeur), height: 190 },
});
console.log('lien au clavier :', await lien.evaluate((a) => { a.focus(); return document.activeElement === a && a.getAttribute('href'); }), boite && `zone d'appui ${Math.round(boite.width)}×${Math.round(boite.height)}`);
await page.evaluate(() => document.activeElement.blur());

await page.mouse.wheel(0, 120);
await page.waitForTimeout(900);
console.log('après 120 px de défilement :', await etat());
await page.screenshot({ path: `captures/${prefixe}-apres-defilement.png` });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
console.log('retour en haut (ne doit pas réapparaître) :', await etat());
await navigateur.close();

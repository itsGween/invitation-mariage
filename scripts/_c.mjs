import { chromium } from 'playwright-core';
const base = process.argv[2];
const nav = await chromium.launch({ channel: 'chrome' });
for (const [code, nom] of [['BJKYTPHE', 'ido-serge'], ['GZ7963EH', 'sissoko-sara']]) {
  for (const [l, h] of [[390, 844], [1440, 900]]) {
    const ctx = await nav.newContext({ viewport: { width: l, height: h }, deviceScaleFactor: l < 1000 ? 2 : 1 });
    const p = await ctx.newPage();
    await p.goto(`${base}?i=${code}`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /Ouvrir/ }).click();
    await p.waitForTimeout(3000);
    const places = await p.locator('.confirmation__places').innerText();
    const ordre = await p.evaluate(() => {
      const t = document.querySelector('.confirmation__texte'), pl = document.querySelector('.confirmation__places'), b = document.querySelector('.confirmation__boutons');
      return t.nextElementSibling === pl && !!(pl.compareDocumentPosition(b) & 4);
    });
    const style = await p.locator('.confirmation__places').evaluate((e) => { const s = getComputedStyle(e); return `${s.fontStyle} ${s.fontSize} ${s.color}`; });
    console.log(l, nom, ordre, style, '|', places);
    const cible = l < 1000 ? p.locator('#confirmation') : p;
    await cible.screenshot({ path: `captures/maj/places-${nom}-${process.argv[3]}-${l}.png` });
    await ctx.close();
  }
}
await nav.close();

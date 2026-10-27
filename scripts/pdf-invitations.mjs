// npm run pdf — script local, jamais déployé.
// À partir de liens.csv (produit par `npm run liens`), écrit les PDF des liens
// (A5, à lire sur téléphone), imprimés par Chrome (Playwright) :
// - si invites.listes.json existe (répartition par feuille de la liste
//   source, ignoré par git) : un PDF pour la liste de Marie-Christelle et un
//   pour celle de Patrice ;
// - sinon : un seul PDF avec tous les invités, dans l'ordre de invites.csv.
// Régénère aussi liens.xlsx.
//
// invites.listes.json : {
//   existants: [noms dont le lien a déjà été transmis],
//   reactives: [anciens noms réintégrés avec leur code d'origine],
//   feuilles: { Maman: [noms], Papa: [noms] },   // ordre de la feuille
//   doublons: { variante: nom déjà présent },     // doublons probables
// }

import { existsSync, readFileSync } from 'node:fs';
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
const FICHIER_LISTES = path.join(racine, 'invites.listes.json');
const FICHIER_XLSX = path.join(racine, 'liens.xlsx');

if (!existsSync(FICHIER_LIENS)) {
  console.error("liens.csv introuvable : lancez d'abord `npm run liens`.");
  process.exit(1);
}

const { apercu, invites, tous } = await lireLiens(FICHIER_LIENS, NOM_APERCU);
const parNom = new Map(tous.map((invite) => [invite.nom, invite]));
const { elle, lui } = wedding.maries;

const echapper = (texte) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const lienHtml = (url) => `<a href="${echapper(url)}">${echapper(url)}</a>`;

// Le lien contenu dans le message devient cliquable.
const messageHtml = ({ message, lien }) =>
  message.split(lien).map(echapper).join(lienHtml(lien));

const mentionsHtml = (mentions = []) =>
  mentions.map((m) => `<p class="mention">${echapper(m)}</p>`).join('');

const inviteHtml = (invite, numero) => `<section class="invite">
    <h3><span class="numero">${numero}.</span> ${echapper(invite.nom)}</h3>
    ${mentionsHtml(invite.mentions)}
    <p class="message">${messageHtml(invite)}</p>
    <p class="envoye"><span class="case">☐</span> Envoyé</p>
  </section>`;

// Doublon probable : le nom déjà présent et la nouvelle variante côte à côte.
const doublonHtml = ({ existant, variante }, numero) => `<section class="invite doublon">
    <p class="avertissement"><span class="numero">${numero}.</span> À n'envoyer que s'il s'agit bien d'une personne différente.</p>
    <div class="cote-a-cote">
      <div class="colonne">
        <p class="etiquette">Déjà présent</p>
        <h3>${echapper(existant.nom)}</h3>
        ${mentionsHtml(existant.mentions)}
        <p class="lien-seul">${lienHtml(existant.lien)}</p>
      </div>
      <div class="colonne colonne--nouvelle">
        <p class="etiquette">Nouvelle variante</p>
        <h3>${echapper(variante.nom)}</h3>
        ${mentionsHtml(variante.mentions)}
        <p class="lien-seul">${lienHtml(variante.lien)}</p>
      </div>
    </div>
    <p class="message">${messageHtml(variante)}</p>
    <p class="envoye"><span class="case">☐</span> Envoyé</p>
  </section>`;

const partieHtml = ({ titre, intro, invites: liste = [], doublons = [], noms }) => `
  <p class="section-titre">${echapper(titre)} (${liste.length + doublons.length + (noms?.length ?? 0)})</p>
  ${intro ? `<p class="intro">${echapper(intro)}</p>` : ''}
  ${liste.map((invite, i) => inviteHtml(invite, i + 1)).join('\n  ')}
  ${doublons.map((d, i) => doublonHtml(d, i + 1)).join('\n  ')}
  ${noms ? `<ul class="noms">${noms.map((n) => `<li>${echapper(n)}</li>`).join('')}</ul>` : ''}`;

function pageHtml({ sousTitre, parties }) {
  const titre = `Invitations : mariage de ${elle} & ${lui}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${echapper(sousTitre ? `${titre} — ${sousTitre}` : titre)}</title>
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
  .sous-titre { margin: 1.5mm 0 0; color: #9a7b3f; font-size: 15pt; font-style: italic; font-weight: 600; }
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
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    text-transform: uppercase;
  }
  .intro { margin: 0 0 5mm; color: #344733; font-style: italic; text-align: center; }
  .invite { margin-bottom: 5mm; break-inside: avoid; }
  .invite h3 { margin: 0 0 1.5mm; color: #344733; font-size: 15pt; font-weight: 700; line-height: 1.2; }
  .numero { color: #9a7b3f; }
  .mention { margin: -0.5mm 0 1.5mm; color: #9a7b3f; font-size: 12pt; font-style: italic; }
  .message {
    margin: 0;
    padding: 3mm 3.5mm;
    border-left: 2pt solid #bf9b5a;
    border-radius: 1.5mm;
    background: #f3ead8;
  }
  .envoye { margin: 1.8mm 0 0; color: #344733; font-weight: 700; }

  .doublon { padding-top: 1mm; }
  .avertissement { margin: 0 0 2mm; color: #6b3a35; font-weight: 700; }
  .cote-a-cote { display: flex; gap: 3mm; margin-bottom: 2mm; }
  .colonne {
    flex: 1 1 0;
    min-width: 0;
    padding: 2.5mm 3mm;
    border: 0.8pt solid #d9bc82;
    border-radius: 2mm;
  }
  .colonne--nouvelle { border: 1.2pt solid #bf9b5a; background: #eef2ea; }
  .colonne h3 { font-size: 13.5pt; }
  .etiquette {
    margin: 0 0 1mm;
    color: #9a7b3f;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .lien-seul { margin: 0; font-size: 12pt; line-height: 1.3; }
  .noms { margin: 0; padding-left: 6mm; }
  .noms li { margin-bottom: 1.2mm; }
</style>
</head>
<body>
  <header class="entete">
    <p class="monogramme">${echapper(wedding.maries.monogramme)}</p>
    <h1>Invitations : mariage de <span class="insecable">${echapper(elle)} &amp; ${echapper(lui)}</span></h1>
    ${sousTitre ? `<p class="sous-titre">${echapper(sousTitre)}</p>` : ''}
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
  ${parties.filter((p) => p.invites?.length || p.doublons?.length || p.noms?.length).map(partieHtml).join('\n')}
</body>
</html>`;
}

async function imprimer(nav, fichier, contenu) {
  const page = await nav.newPage();
  await page.setContent(contenu, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: fichier, preferCSSPageSize: true, printBackground: true, tagged: true });
  await page.close();
}

const nav = await chromium.launch({ channel: 'chrome' });
try {
  if (!existsSync(FICHIER_LISTES)) {
    const fichier = path.join(racine, 'Invitations-Mariage-Marie-Christelle-Patrice.pdf');
    await imprimer(nav, fichier, pageHtml({ parties: [{ titre: 'Les invités', invites }] }));
    await ecrireXlsx(FICHIER_XLSX, tous);
    console.log(`Écrit : ${path.basename(fichier)} (${invites.length} invités${apercu ? " + lien d'aperçu" : ''}), liens.xlsx`);
  } else {
    const listes = JSON.parse(readFileSync(FICHIER_LISTES, 'utf8'));
    const existants = new Set(listes.existants);
    const reactives = new Set(listes.reactives ?? []);
    const doublons = listes.doublons ?? {};
    const surMaman = new Set(listes.feuilles.Maman);
    const surPapa = new Set(listes.feuilles.Papa);
    const invite = (nom, mentions = []) => {
      const trouve = parNom.get(nom);
      if (!trouve) throw new Error(`Nom absent de liens.csv : ${nom}`);
      return { ...trouve, mentions };
    };

    // Liste de Marie-Christelle
    const aussiPapa = (nom) => (surPapa.has(nom) ? [`Aussi sur la liste de ${lui}`] : []);
    const nouveauxMaman = listes.feuilles.Maman.filter((n) => !existants.has(n) && !doublons[n]);
    const maman = [
      {
        titre: 'Liens déjà transmis',
        intro:
          "Vous avez déjà reçu ces liens dans le document précédent. Ils n'ont pas changé : inutile de les renvoyer aux invités à qui vous les avez déjà envoyés.",
        invites: listes.existants.map((n) => invite(n, aussiPapa(n))),
      },
      {
        titre: 'Nouveaux liens à envoyer',
        intro: 'Ces invitations sont nouvelles : envoyez chaque message à la personne concernée.',
        invites: nouveauxMaman.map((n) =>
          invite(n, [
            ...(reactives.has(n) ? ['Lien inchangé : si vous le lui avez déjà envoyé, inutile de le renvoyer.'] : []),
            ...aussiPapa(n),
          ]),
        ),
      },
      {
        titre: 'Potentiels doublons à vérifier',
        doublons: listes.feuilles.Maman.filter((n) => doublons[n]).map((n) => ({
          existant: invite(doublons[n], aussiPapa(doublons[n])),
          variante: invite(n, aussiPapa(n)),
        })),
      },
    ];

    // Liste de Patrice
    const dejaTransmis = (nom) => (existants.has(nom) ? [`Lien déjà transmis à ${elle}`] : []);
    const aussiMaman = (nom) => (surMaman.has(nom) && !existants.has(nom) ? [`Aussi sur la liste de ${elle}`] : []);
    const papa = [
      {
        titre: 'Les invités',
        invites: listes.feuilles.Papa.filter((n) => !doublons[n]).map((n) =>
          invite(n, [...dejaTransmis(n), ...aussiMaman(n)]),
        ),
      },
      {
        titre: 'Potentiels doublons à vérifier',
        doublons: listes.feuilles.Papa.filter((n) => doublons[n]).map((n) => ({
          existant: invite(doublons[n], dejaTransmis(doublons[n])),
          variante: invite(n, aussiMaman(n)),
        })),
      },
    ];

    const documents = [
      ['Invitations-Mariage-Liste-Maman.pdf', `Liste de ${elle}`, maman],
      ['Invitations-Mariage-Liste-Papa.pdf', `Liste de ${lui}`, papa],
    ];
    for (const [nomFichier, sousTitre, parties] of documents) {
      await imprimer(nav, path.join(racine, nomFichier), pageHtml({ sousTitre, parties }));
      const detail = parties.map((p) => `${p.titre} : ${(p.invites?.length ?? 0) + (p.doublons?.length ?? 0)}`);
      console.log(`Écrit : ${nomFichier} (${detail.join(', ')})`);
    }

    // Excel : colonnes Liste et Statut
    const liste = (nom) => {
      if (nom === NOM_APERCU) return 'Aperçu';
      const m = surMaman.has(nom) || existants.has(nom) || reactives.has(nom);
      const p = surPapa.has(nom);
      return m && p ? 'Maman et Papa' : p ? 'Papa' : 'Maman';
    };
    const statut = (nom) => (nom === NOM_APERCU ? '' : existants.has(nom) ? 'Déjà transmis' : 'Nouveau');
    await ecrireXlsx(
      FICHIER_XLSX,
      tous.map((i) => ({ ...i, liste: liste(i.nom), statut: statut(i.nom) })),
    );
    console.log('Écrit : liens.xlsx');
  }
} finally {
  await nav.close();
}

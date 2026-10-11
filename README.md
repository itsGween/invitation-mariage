# Invitation de mariage — Marie-Christelle & Patrice

Site statique (Vite + React + TypeScript). Chaque invité reçoit un lien
personnel du type `https://…/?i=K7XP2M9A` : l'enveloppe porte son nom,
s'ouvre, puis affiche l'invitation et les détails de la journée.

## Lancer en local

Il faut Node.js 22.18 ou plus récent.

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173. Sans code dans l'adresse, c'est
l'écran « Cette invitation est personnelle » qui s'affiche : pour voir
l'invitation, ajoutez un code pris dans `liens.csv`, par exemple
`http://localhost:5173/?i=K7XP2M9A`.

En local uniquement, deux raccourcis existent pour les essais :
`&ecran=invitation` saute l'enveloppe et `&direction=B` affiche l'autre
direction graphique.

## Modifier les informations

Tout le contenu est dans **`src/config/wedding.ts`** : prénoms, date, heure,
lieu, lien d'itinéraire, programme, tenue, contact, textes.

À vérifier avant l'envoi (repérés par `À CONFIRMER` / `À REMPLACER` dans le
fichier) :

- `date`, `heure` et `programme` ;
- `contact` (courriel et téléphone) ;
- `site.url` : l'adresse publique du site, utilisée dans les liens envoyés
  et dans l'aperçu WhatsApp ;
- `calendrier` : heures de début et de fin de l'événement ajouté au
  calendrier (en heure d'Abidjan).

`direction` vaut `'A'` (cadre doré et roses) ou `'B'` (aquarelle aérienne).

La date s'écrit `AAAA-MM-JJ` ; « samedi », « 14 » et « novembre » en sont
déduits automatiquement.

Si vous changez les prénoms ou la date, régénérez l'image d'aperçu
(`public/apercu.jpg`) : laissez `npm run dev` tourner et lancez
`npm run apercu` dans un second terminal (Google Chrome doit être installé).

> Ne modifiez pas `acces.sel` ni `acces.iterations` après l'envoi des
> invitations : tous les liens cesseraient de fonctionner.

## Ajouter ou retirer des invités, générer les liens

1. Ouvrez `invites.csv` à la racine et écrivez **un nom par ligne**. Le
   fichier livré contient deux noms d'essai, à remplacer.
2. Lancez :

   ```bash
   npm run liens
   ```

3. Récupérez les liens dans le format qui vous convient : `liens.xlsx`
   (tableau avec une colonne « Envoyé » à cocher), `liens.docx` (une fiche
   par invité : nom, lien, message prêt à copier) ou `liens.csv`. Fermez ces
   fichiers dans Excel et Word avant de relancer la commande, sinon ils ne
   peuvent pas être mis à jour.
4. Redéployez le site (voir plus bas) : un nouveau lien ne fonctionne
   qu'une fois `src/data/invites.json` mis en ligne.

Ce que fait la commande :

- elle nettoie les noms (espaces en trop, majuscule à chaque mot, y compris
  après un tiret ou une apostrophe) et signale les doublons ;
- elle garde les codes déjà attribués et n'en crée que pour les nouveaux
  noms : vous pouvez la relancer autant de fois que nécessaire ;
- **retirer un nom de `invites.csv` désactive son lien** au prochain
  déploiement ; le remettre réactive le même lien.

Fichiers produits :

| Fichier | Contenu | Git |
| --- | --- | --- |
| `src/data/invites.json` | noms chiffrés, lus par le site | à versionner |
| `liens.csv`, `liens.xlsx`, `liens.docx` | nom, lien, message | ignorés |
| `invites.codes.json` | correspondance nom / code | ignoré |

`invites.csv`, les fichiers `liens.*` et `invites.codes.json` contiennent la
liste en clair : gardez-les sur votre ordinateur, avec une copie de sauvegarde de
`invites.codes.json`. Sans ce fichier, la commande attribuerait de nouveaux
codes à tout le monde.

### Comment la liste est protégée

Le site ne contient ni les noms ni les codes. À partir du code du lien, le
navigateur calcule 64 octets (PBKDF2-SHA-256, 200 000 itérations) : la
première moitié sert à retrouver la ligne de l'invité, la seconde à
déchiffrer son nom (AES-GCM). Sans un code valide, `invites.json` est
illisible.

## Remplacer les illustrations

Les aquarelles sont dans `src/assets/illustrations/`, en WebP à fond
transparent, chacune en deux tailles : `nom-600.webp` (mobile) et
`nom.webp` (1000 px).

Pour en remplacer une, gardez **le même nom de fichier et le même cadrage**
(bouquet d'angle ou gerbe diagonale). Si les dimensions en pixels changent,
mettez-les à jour dans le tableau `DIMENSIONS` de
`src/components/Illustration.tsx`.

Le sceau de cire de l'enveloppe est l'image `sceau.webp` du même dossier
(480 px, fond transparent). Le monogramme y est gravé : si les initiales
changent, il faut remplacer cette image.

Le dossier `illustrations-mariage/` (originaux et maquette) n'est pas
utilisé par le site et n'est pas versionné : gardez-en une copie.

## Déployer sur Vercel

Le site doit être servi en HTTPS, ce que Vercel fait par défaut.

1. Lancez `npm run liens` si la liste a changé.
2. Poussez le projet sur un dépôt Git et importez-le dans Vercel (préréglage
   « Vite » détecté automatiquement : commande `npm run build`, dossier
   `dist`). Ou, sans dépôt : `npx vercel --prod` depuis ce dossier.
3. Reportez l'adresse obtenue dans `site.url` (`src/config/wedding.ts`),
   relancez `npm run liens` pour que `liens.csv` utilise la bonne adresse,
   puis redéployez.

Chaque changement de contenu ou de liste d'invités demande un nouveau
déploiement.

## Contrôles

- `npm run build` : vérifie les types et construit le site dans `dist/`.
- `npm run captures -- <nom> "?i=CODE"` : captures à 390 px et 1440 px dans
  `captures/` (serveur de développement lancé, Google Chrome installé).

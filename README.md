# Invitation de mariage — Marie-Christelle & Patrice

Site statique (Vite + React + TypeScript) et une fonction serveur Vercel
(`api/reponse.ts`). Chaque invité reçoit un lien personnel du type
`https://…/?i=K7XP2M9A` : l'enveloppe s'ouvre, puis affiche l'invitation à son
nom, le programme (avec les itinéraires), la confirmation de présence et les
contacts. Chaque réponse est définitive : elle est enregistrée côté serveur
(Redis) et envoyée par courriel.

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

Tout le contenu affiché est dans **`src/config/wedding.ts`** : prénoms, date,
texte de l'invitation, programme (heures, lieux, liens Google Maps), textes
de la confirmation et messages de remerciement, contacts (appel et
WhatsApp), pied de page, message envoyé aux invités.

`direction` vaut `'A'` (cadre doré et roses) ou `'B'` (aquarelle aérienne).

La date s'écrit `AAAA-MM-JJ` ; « samedi », « 14 » et « novembre » en sont
déduits automatiquement.

Si vous changez les prénoms ou la date, régénérez l'image d'aperçu
(`public/apercu.jpg`) : laissez `npm run dev` tourner et lancez
`npm run apercu` dans un second terminal (Google Chrome doit être installé).

> Ne modifiez pas `acces.sel` ni `acces.iterations` après l'envoi des
> invitations : tous les liens cesseraient de fonctionner.

## Réponses des invités (définitives)

Une fois qu'un lien a répondu, la réponse est définitive pour ce lien, quels
que soient le navigateur et l'appareil : seul le serveur fait foi, rien n'est
mémorisé dans le navigateur.

- `GET /api/reponse?code=…` renvoie la réponse déjà enregistrée, ou
  `{ "reponse": "aucune" }` (404 si le code est inconnu). La section
  Confirmation l'interroge à l'ouverture et n'affiche les boutons qu'ensuite.
- `POST /api/reponse` (`{ code, reponse }`) enregistre la réponse de façon
  atomique (Redis `SET NX`), puis envoie le courriel via Resend. Si ce lien a
  déjà répondu : 409 avec la réponse existante, sans courriel. Si l'envoi du
  courriel échoue, la réponse est effacée pour que l'invité puisse réessayer.

Avant l'envoi, la page demande confirmation (« Cette réponse sera
définitive. »). Ensuite, elle affiche la réponse sans aucun bouton, avec
« Un changement ou une erreur ? Contactez-nous. » (texte simple).

Dans Redis, la clé est l'identifiant dérivé du code (`reponse:<id>`, jamais le
nom ni le code), la valeur `{ reponse, date }`. Le code partagé par la
fonction et les scripts est dans `src/lib/registre.ts`.

Variables d'environnement Vercel :

- `RESEND_API_KEY` : clé Resend (obligatoire, Production) ;
- `KV_REST_API_URL` et `KV_REST_API_TOKEN` : base Redis Upstash connectée au
  projet (obligatoires, Production et Preview) ;
- `RSVP_DESTINATAIRE` : adresse qui reçoit les réponses (facultatif, adresse
  par défaut définie dans `api/reponse.ts`).

L'objet et le texte des courriels sont dans `api/reponse.ts`. Avec
l'expéditeur de test `onboarding@resend.dev`, Resend n'accepte d'envoyer
qu'à l'adresse du compte Resend.

En local (`npm run dev`), tout est simulé (aucun appel réseau, aucun
courriel). `&rsvp=present` ou `&rsvp=absent` simule un lien qui a déjà
répondu, `&rsvp=attente` une vérification qui ne se termine pas,
`&rsvp=echec` un envoi qui échoue et `&rsvp=lent` un envoi qui dure.

### Administrer les réponses

Les scripts lisent `KV_REST_API_URL` et `KV_REST_API_TOKEN` dans
`.env.local` (ignoré par git). Ces variables sont « sensibles » dans Vercel :
`vercel env pull` ne les récupère pas, copiez-les depuis la page de la base.

```bash
npm run reponses                                  # liste et totaux
npm run reponse -- "Nom exact" present            # enregistre, sans courriel
npm run reinitialiser -- "Nom exact"              # efface la réponse
```

`npm run reponses` affiche nom, réponse et date, puis les invités ayant
répondu, les présents, les absents et les places confirmées (2 pour
« M. et Mme », 1 sinon). Les liens de test (« Gween Kangah »,
« Hans-Berryl ») sont listés mais jamais comptés.

## Ajouter ou retirer des invités, générer les liens

1. Ouvrez `invites.csv` à la racine et écrivez **un nom par ligne**.
2. Lancez :

   ```bash
   npm run liens
   ```

3. Récupérez les liens dans `liens.xlsx` (colonne « Envoyé » à cocher) ou
   `liens.csv`. Pour le document à lire sur téléphone, lancez `npm run pdf`
   (PDF A5 imprimé par Chrome, liens cliquables) ou `npm run document`
   (version Word) : ils produisent
   `Invitations-Mariage-Marie-Christelle-Patrice.pdf` ou `.docx` (ou, si
   `invites.listes.json` existe, un PDF par liste), `Liens-de-test-Gween.pdf`,
   et régénèrent `liens.xlsx`. Fermez ces fichiers avant de relancer les
   commandes.
4. Redéployez le site (voir plus bas) : un nouveau lien ne fonctionne
   qu'une fois `src/data/invites.json` mis en ligne.

Ce que fait la commande :

- elle garde les noms tels qu'écrits (accents, orthographe, majuscules),
  retire les espaces en trop, normalise les civilités de tête (« M. »,
  « Mme », « Mlle », « Abbé », « Maître », « et » et « épouse » en minuscule) et signale
  les doublons ;
- elle garde les codes déjà attribués et n'en crée que pour les nouveaux
  noms : vous pouvez la relancer autant de fois que nécessaire ;
- **retirer un nom de `invites.csv` désactive son lien** au prochain
  déploiement ; le remettre réactive le même lien.

Fichiers produits :

| Fichier | Contenu | Git |
| --- | --- | --- |
| `src/data/invites.json` | noms chiffrés, lus par le site | à versionner |
| `liens.csv`, `liens.xlsx`, documents PDF et Word | nom, lien, message | ignorés |
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
4. Ajoutez `RESEND_API_KEY` dans les variables d'environnement du projet
   Vercel (voir « Réponses des invités »).

Chaque changement de contenu ou de liste d'invités demande un nouveau
déploiement.

## Contrôles

- `npm run build` : vérifie les types et construit le site dans `dist/`.
- `npm run captures -- <nom> "?i=CODE"` : captures à 390 px et 1440 px dans
  `captures/` (serveur de développement lancé, Google Chrome installé).
- `node scripts/captures-ecrans.mjs captures` : tous les écrans, y compris
  les états de la confirmation.

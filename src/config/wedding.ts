// Tout le contenu du site est ici. Ce fichier est aussi lu par
// `npm run liens` : il ne doit contenir que des données (pas d'import).

export type Direction = 'A' | 'B';
export type IconeProgramme = 'eglise' | 'couverts';

export const wedding = {
  maries: {
    elle: 'Marie-Christelle',
    lui: 'Patrice',
    monogramme: 'MC & P',
  },

  // À CONFIRMER — format AAAA-MM-JJ. Le jour de la semaine, le jour et le
  // mois affichés sur l'invitation sont calculés à partir de cette date.
  date: '2026-11-14',

  // À CONFIRMER — heure affichée sur l'invitation.
  heure: '13h30',

  lieu: {
    nom: "L'espace Splendide",
    salle: 'Splendid Home Event and Memories',
    adresse: "Angré 7ème tranche (en face de l'AFOR)",
    ville: 'Cocody, Abidjan',
    pays: "Côte d'Ivoire",
  },

  itineraire:
    'https://www.google.com/maps/search/?api=1&query=Splendid+Home+Event+and+Memories+Angré+7ème+tranche+Cocody+Abidjan',

  // À CONFIRMER
  programme: [
    {
      heure: '10h00',
      titre: 'Messe',
      lieu: ['Église St Jean Paul 2'],
      icone: 'eglise' as IconeProgramme,
    },
    {
      heure: '13h30',
      titre: 'Déjeuner',
      lieu: ["L'espace Splendide", 'Cocody, Abidjan'],
      icone: 'couverts' as IconeProgramme,
    },
  ],

  tenue: 'Tenue élégante dans les tons pastel',

  // À REMPLACER
  contact: {
    courriel: 'contact@mariechristelle-patrice.ci',
    telephone: '+225 07 01 23 45 67',
  },

  // 'A' : cadre doré et roses — 'B' : aquarelle aérienne
  direction: 'A' as Direction,

  // Colonne de gauche de la version ordinateur
  accroche: {
    titre: "Un grand jour d'amour",
    texte:
      'Nous sommes heureux de vous convier à notre mariage et de partager avec vous cette journée si spéciale.',
  },

  lienInvalide: {
    titre: 'Cette invitation est personnelle.',
    texte: "Merci d'utiliser le lien que vous avez reçu.",
  },

  // Événement du fichier .ics, en heure d'Abidjan (UTC+0 toute l'année).
  calendrier: {
    debut: '10:00',
    fin: '18:00',
  },

  site: {
    // À REMPLACER — adresse publique du site, sans barre oblique finale.
    url: 'https://mariage-marie-christelle-patrice.vercel.app',
    titre: 'Marie-Christelle & Patrice — Invitation',
    description: 'Vous êtes invité(e) à notre mariage. Ouvrez votre invitation personnelle.',
    // {nom} et {lien} sont remplacés par `npm run liens`.
    message:
      'Bonjour {nom}, voici votre invitation au mariage de Marie-Christelle & Patrice : {lien}',
  },

  // Protection de la liste des invités. Modifier `sel` ou `iterations`
  // invalide tous les liens déjà envoyés.
  acces: {
    sel: 'mariage-mc-p-2026-11-14-f3a9c1',
    iterations: 200_000,
  },
};

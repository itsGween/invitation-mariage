// Tout le contenu affiché par le site est ici. Ce fichier est aussi lu par
// `npm run liens` et par la fonction serveur api/reponse.ts : il ne doit
// contenir que des données (pas d'import).
//
// Les courriels de réponse (objet, texte) et leur destinataire sont définis
// côté serveur uniquement, dans api/reponse.ts.

export type Direction = 'A' | 'B';
export type Icone = 'eglise' | 'couverts';

export const wedding = {
  maries: {
    elle: 'Marie-Christelle',
    lui: 'Patrice',
    monogramme: 'MC & P',
  },

  // Format AAAA-MM-JJ. Le jour de la semaine, le jour et le mois affichés
  // sont calculés à partir de cette date.
  date: '2026-11-14',

  // 'A' : cadre doré et roses — 'B' : aquarelle aérienne
  direction: 'A' as Direction,

  // Carte qui sort de l'enveloppe à l'ouverture
  ouverture: {
    titre: 'Bienvenue',
    sousTitre: 'à notre mariage',
  },

  invitation: {
    // {nom} est remplacé par le nom de l'invité.
    salutation: 'Bonjour {nom},',
    texte:
      "C’est avec un cœur rempli de gratitude et de joie que nous nous unirons devant Dieu par le sacrement du mariage. Nous serions honorés de partager ce moment unique avec vous.",
  },

  programme: {
    titre: 'Le programme',
    etapes: [
      {
        heure: '10h00',
        titre: 'Messe',
        lieu: 'à la paroisse Saint Jean-Paul II',
        icone: 'eglise' as Icone,
      },
      {
        heure: '13h30',
        titre: 'Déjeuner',
        lieu: "à l'espace Splendide",
        icone: 'couverts' as Icone,
      },
    ],
  },

  itineraires: {
    titre: 'Itinéraires',
    bouton: "Voir l'itinéraire",
    lieux: [
      {
        titre: 'Cérémonie',
        lignes: ['Paroisse Saint Jean-Paul II', 'Cocody, Abidjan'],
        icone: 'eglise' as Icone,
        // Plus code Google du lieu : place le repère au bon endroit.
        lien: 'https://www.google.com/maps/search/?api=1&query=92XH%2BG9W%20Abidjan',
      },
      {
        titre: 'Déjeuner',
        lignes: ["L'espace Splendide", 'Angré 7ème tranche, Cocody'],
        icone: 'couverts' as Icone,
        lien: 'https://www.google.com/maps/search/?api=1&query=92Q8%2B2F6%20Abidjan',
      },
    ],
  },

  confirmation: {
    titre: 'Confirmation de présence',
    texte:
      'Pour nous permettre de bien organiser cette journée, merci de confirmer votre présence le plus tôt possible.',
    // Places prévues, déduites du nom : 2 pour « M. et Mme … », 1 sinon.
    placesDeux:
      'Afin de vous accueillir dans les meilleures conditions, cette invitation est prévue uniquement pour deux personnes. Merci de votre compréhension.',
    placesUne:
      'Afin de vous accueillir dans les meilleures conditions, cette invitation est prévue uniquement pour une personne. Merci de votre compréhension.',
    boutonPresent: 'Je confirme ma présence',
    boutonAbsent: 'Je regrette de ne pas pouvoir être des vôtres',
    envoi: 'Envoi…',
    merciPresent:
      'Merci ! Votre présence est bien confirmée. Nous avons hâte de partager ce jour avec vous.',
    merciAbsent: 'Merci pour votre réponse. Vous serez dans nos pensées en ce jour.',
    // Affiché lors d'une visite suivante, d'après la réponse mémorisée
    rappelPresent: 'Votre réponse : présence confirmée',
    rappelAbsent: 'Votre réponse : absence',
    modifier: 'Modifier ma réponse',
    echec:
      "L'envoi n'a pas abouti. Merci de réessayer, ou de nous contacter au +225 07 07 86 41 82.",
    reessayer: 'Réessayer',
  },

  // Encart affiché sous la réponse de l'invité, jamais avant
  presentation: {
    texte:
      'Cette invitation vous a plu ? Je crée des invitations numériques personnalisées pour toutes vos cérémonies : mariages, baptêmes, anniversaires…',
    nom: 'Gween Kangah',
    courriel: 'kangahhansberryl7@outlook.com',
    objet: "Demande d'invitation numérique",
  },

  contact: {
    titre: 'Nous contacter',
    courriel: 'christelleahua@yahoo.fr',
    telephone: '+225 07 07 86 41 82',
  },

  // En-tête de la version ordinateur
  navigation: {
    accueil: 'Accueil',
    invitation: 'Invitation',
    programme: 'Programme',
    itineraires: 'Itinéraires',
    confirmation: 'Confirmation',
    bouton: 'Confirmer ma présence',
  },

  // Indicateur de défilement sous la carte (mobile)
  indicateur: {
    libelle: 'Découvrir',
    description: 'Voir le programme',
  },

  lienInvalide: {
    titre: 'Cette invitation est personnelle.',
    texte: "Merci d'utiliser le lien que vous avez reçu.",
  },

  site: {
    // Adresse publique du site, sans barre oblique finale.
    url: 'https://invitation-mariage-pi.vercel.app',
    titre: 'Marie-Christelle & Patrice — Invitation',
    description: 'Vous êtes invité(e) à notre mariage. Ouvrez votre invitation personnelle.',
    // {nom} et {lien} sont remplacés par `npm run liens`.
    message:
      "Bonjour {nom}, c'est avec joie que nous vous adressons votre invitation au mariage de Marie-Christelle & Patrice. Ce lien vous est personnel : {lien}",
  },

  // Protection de la liste des invités. Modifier `sel` ou `iterations`
  // invalide tous les liens déjà envoyés.
  acces: {
    sel: 'mariage-mc-p-2026-11-14-f3a9c1',
    iterations: 200_000,
  },
};

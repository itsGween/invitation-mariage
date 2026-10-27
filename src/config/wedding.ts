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

  // Une carte par événement, avec l'itinéraire. `lien` : plus code Google
  // du lieu, qui place le repère au bon endroit.
  programme: {
    titre: 'Programme',
    bouton: "Voir l'itinéraire",
    etapes: [
      {
        titre: 'Cérémonie',
        heure: '10h00',
        lieu: 'Paroisse Saint Jean-Paul II',
        adresse: 'Cocody, Abidjan',
        icone: 'eglise' as Icone,
        lien: 'https://www.google.com/maps/search/?api=1&query=92XH%2BG9W%20Abidjan',
      },
      {
        titre: 'Déjeuner',
        heure: '13h30',
        lieu: "L'espace Splendide",
        adresse: 'Angré 7ème tranche, Cocody',
        icone: 'couverts' as Icone,
        lien: 'https://www.google.com/maps/search/?api=1&query=92Q8%2B2F6%20Abidjan',
      },
    ],
  },

  confirmation: {
    titre: 'Confirmation de présence',
    texte:
      'Pour nous permettre de bien organiser cette journée, merci de confirmer votre présence avant le lundi 9 novembre.',
    // Places prévues, déduites du nom : 2 pour « M. et Mme … », 1 sinon.
    placesDeux:
      'Afin de vous accueillir dans les meilleures conditions, cette invitation est prévue uniquement pour deux personnes. Merci de votre compréhension.',
    placesUne: 'Merci de noter : cette invitation est personnelle.',
    // Pendant la lecture de la réponse déjà enregistrée
    attente: 'Un instant…',
    erreurLecture: "Votre réponse n'a pas pu être vérifiée. Merci de réessayer dans un instant.",
    boutonPresent: 'Je confirme ma présence',
    boutonAbsent: 'Je regrette de ne pas pouvoir être des vôtres',
    // Demande de confirmation, dans la page, avant tout envoi
    demandePresent: 'Confirmer votre présence ? Cette réponse sera définitive.',
    demandeAbsent: 'Confirmer votre absence ? Cette réponse sera définitive.',
    oui: 'Oui, confirmer',
    annuler: 'Annuler',
    envoi: 'Envoi…',
    // État final, après une réponse ou si ce lien a déjà répondu
    merciPresent: 'Merci ! Nous avons hâte de partager ce jour avec vous.',
    merciAbsent: 'Merci pour votre réponse. Vous serez dans nos pensées en ce jour.',
    rappelPresent: 'Votre réponse : présence confirmée',
    rappelAbsent: 'Votre réponse : absence',
    changement: 'Un changement ou une erreur ? Contactez-nous.',
    echec:
      "L'envoi n'a pas abouti. Merci de réessayer, ou de nous contacter au +225 07 07 86 41 82.",
    reessayer: 'Réessayer',
  },

  contacts: {
    titre: 'Contacts',
    sousTitre: 'Joignables par appel ou WhatsApp',
    whatsapp: 'WhatsApp',
    telephones: [
      {
        numero: '+225 07 07 86 41 82',
        appel: 'tel:+2250707864182',
        whatsapp: 'https://wa.me/2250707864182',
      },
      {
        numero: '+225 01 02 09 80 80',
        appel: 'tel:+2250102098080',
        whatsapp: 'https://wa.me/2250102098080',
      },
    ],
  },

  // Pied de page, tout en bas de l'invitation ouverte
  credit: {
    auteur: 'Invitation conçue par Gween Kangah',
    offre: 'Invitations numériques sur mesure pour vos mariages, baptêmes et cérémonies',
    courriel: 'kangahhansberryl7@outlook.com',
    objet: "Demande d'invitation numérique",
  },

  // En-tête de la version ordinateur
  navigation: {
    accueil: 'Accueil',
    invitation: 'Invitation',
    programme: 'Programme',
    confirmation: 'Confirmation',
    bouton: 'Confirmer ma présence',
  },

  // Bouton sous la carte (mobile) : mène au programme
  indicateur: {
    libelle: 'Faire défiler',
    description: 'Faire défiler jusqu’au programme',
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

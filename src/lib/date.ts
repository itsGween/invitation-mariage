import { wedding } from '../config/wedding.ts';

// La date est interprétée en UTC, qui est aussi l'heure d'Abidjan.
const jourJ = new Date(`${wedding.date}T00:00:00Z`);

const partie = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: 'UTC' }).format(jourJ);

export const dateAffichee = {
  iso: wedding.date,
  jourSemaine: partie({ weekday: 'long' }),
  jour: partie({ day: 'numeric' }),
  mois: partie({ month: 'long' }),
  annee: partie({ year: 'numeric' }),
};

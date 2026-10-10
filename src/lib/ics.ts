import { wedding } from '../config/wedding.ts';

const echapper = (texte: string) =>
  texte.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// RFC 5545 : lignes de 75 octets au plus, la suite commence par une espace.
function plier(ligne: string): string {
  const encodeur = new TextEncoder();
  let sortie = '';
  let octets = 0;
  for (const caractere of ligne) {
    const taille = encodeur.encode(caractere).length;
    if (octets + taille > 74) {
      sortie += '\r\n ';
      octets = 1;
    }
    sortie += caractere;
    octets += taille;
  }
  return sortie;
}

// « 2026-11-14 » + « 13:30 » → « 20261114T133000Z » (Abidjan = UTC+0 toute l'année)
const horodatage = (date: string, heure: string) =>
  `${date.replace(/-/g, '')}T${heure.replace(':', '')}00Z`;

export function genererIcs(): string {
  const { maries, lieu, programme, calendrier, date, itineraire } = wedding;
  const description = programme
    .map((etape) => `${etape.heure} ${etape.titre} — ${etape.lieu.join(', ')}`)
    .join('\n');
  const adresse = [lieu.nom, lieu.salle, lieu.adresse, lieu.ville, lieu.pays].join(', ');
  const maintenant = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitation mariage//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:mariage-${date}@${new URL(wedding.site.url).hostname}`,
    `DTSTAMP:${maintenant}`,
    `DTSTART:${horodatage(date, calendrier.debut)}`,
    `DTEND:${horodatage(date, calendrier.fin)}`,
    `SUMMARY:${echapper(`Mariage de ${maries.elle} & ${maries.lui}`)}`,
    `LOCATION:${echapper(adresse)}`,
    `DESCRIPTION:${echapper(`${description}\n\nItinéraire : ${itineraire}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(plier)
    .join('\r\n')
    .concat('\r\n');
}

export function telechargerIcs() {
  const blob = new Blob([genererIcs()], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = 'mariage.ics';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

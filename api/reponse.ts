// POST /api/reponse — { code, reponse: "present" | "absent" }
// Retrouve le nom de l'invité à partir du code (même dérivation et même
// fichier chiffré que le site) et envoie sa réponse par courriel via Resend.
// Le navigateur n'envoie jamais le nom ; le destinataire et la clé ne
// quittent jamais le serveur.

import { wedding } from '../src/config/wedding.ts';
import { codeValide, nombrePlaces, nomDepuisCode } from '../src/lib/invites.ts';

const EXPEDITEUR = 'Invitation Mariage <onboarding@resend.dev>';
const DESTINATAIRE_PAR_DEFAUT = 'kangahhansberryl7@outlook.com';
const FUSEAU = 'Africa/Abidjan';

type Reponse = 'present' | 'absent';

const json = (corps: unknown, status: number) =>
  Response.json(corps, { status, headers: { 'Cache-Control': 'no-store' } });

const echapper = (texte: string) =>
  texte.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// « 22 octobre 2026 à 14 h 05 », heure d'Abidjan
function horodatage(instant: Date): string {
  const parties = Object.fromEntries(
    new Intl.DateTimeFormat('fr-FR', {
      timeZone: FUSEAU,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  return `${parties.day} ${parties.month} ${parties.year} à ${Number(parties.hour)} h ${parties.minute}`;
}

// « samedi 14 novembre 2026 »
const dateMariage = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${wedding.date}T00:00:00Z`));

function courriel(nom: string, reponse: Reponse, instant: Date) {
  const { elle, lui } = wedding.maries;
  const mariage = `le mariage de ${elle} & ${lui} du ${dateMariage}`;
  const present = reponse === 'present';
  const places = nombrePlaces(nom);
  const objet = present
    ? `Présence confirmée : ${nom} (${places} ${places > 1 ? 'places' : 'place'})`
    : `Absence : ${nom}`;
  const lignePlaces = present ? `Places réservées : ${places}` : null;
  const annonce = present ? 'Bonne nouvelle !' : null;
  const phrase = present
    ? `présence confirmée pour ${mariage}.`
    : `absence annoncée, avec regret, pour ${mariage}.`;
  const pied = `Réponse envoyée depuis l'invitation en ligne le ${horodatage(instant)} (heure d'Abidjan).`;

  const texte = [annonce, `${nom} : ${phrase}`, lignePlaces, '', pied]
    .filter((l) => l !== null)
    .join('\n');

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;padding:24px 12px;background:#faf6f0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #bf9b5a;border-radius:8px;">
<tr><td style="padding:28px 28px 8px;font-family:Georgia,'Times New Roman',serif;color:#344733;">
${annonce ? `<p style="margin:0 0 12px;font-size:22px;color:#9a7b3f;font-style:italic;">${annonce}</p>` : ''}
<p style="margin:0 0 16px;font-size:18px;line-height:1.5;"><strong>${echapper(nom)}</strong> : ${echapper(phrase)}</p>
${lignePlaces ? `<p style="margin:0 0 16px;font-size:18px;line-height:1.5;">${lignePlaces}</p>` : ''}
</td></tr>
<tr><td style="padding:0 28px 24px;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.5;color:#56634f;border-top:1px solid #ead9b8;">
<p style="margin:16px 0 0;">${echapper(pied)}</p>
</td></tr>
</table>
</body></html>`;

  return { objet, texte, html };
}

export async function POST(requete: Request): Promise<Response> {
  let corps: { code?: unknown; reponse?: unknown };
  try {
    corps = await requete.json();
  } catch {
    return json({ erreur: 'Requête invalide' }, 400);
  }

  const code = codeValide(corps?.code);
  const nom = code ? await nomDepuisCode(code).catch(() => null) : null;
  if (!nom) return json({ erreur: 'Invitation inconnue' }, 404);

  const reponse = corps.reponse;
  if (reponse !== 'present' && reponse !== 'absent') {
    return json({ erreur: 'Réponse invalide' }, 400);
  }

  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.error('RESEND_API_KEY manquante : aucun courriel ne peut être envoyé.');
    return json({ erreur: 'Envoi indisponible' }, 500);
  }

  const { objet, texte, html } = courriel(nom, reponse, new Date());
  const envoi = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: EXPEDITEUR,
      to: [process.env.RSVP_DESTINATAIRE || DESTINATAIRE_PAR_DEFAUT],
      subject: objet,
      text: texte,
      html,
    }),
  }).catch((erreur: unknown) => erreur);

  if (!(envoi instanceof Response) || !envoi.ok) {
    const detail =
      envoi instanceof Response ? `${envoi.status} ${await envoi.text().catch(() => '')}` : String(envoi);
    console.error(`Envoi Resend échoué (${reponse}) : ${detail}`);
    return json({ erreur: "L'envoi n'a pas abouti" }, 502);
  }

  console.log(`Réponse « ${reponse} » envoyée par courriel.`);
  return json({ ok: true }, 200);
}

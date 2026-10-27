export type Reponse = 'present' | 'absent';

// Seul le serveur fait foi (api/reponse.ts) : une réponse enregistrée est
// définitive pour ce lien, quels que soient le navigateur et l'appareil.
// Rien n'est mémorisé dans le navigateur.

// `npm run dev` ne fait pas tourner les fonctions Vercel : réponses simulées,
// sans appel réseau ni courriel. ?rsvp=present ou ?rsvp=absent simule un lien
// qui a déjà répondu, ?rsvp=attente une lecture qui ne se termine pas,
// ?rsvp=echec un envoi qui échoue, ?rsvp=lent un envoi qui dure.
const simulation = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get('rsvp')
  : null;
const attendre = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function reponseValide(valeur: unknown): Reponse | null {
  return valeur === 'present' || valeur === 'absent' ? valeur : null;
}

/** Réponse déjà enregistrée pour ce lien, ou `null`. */
export async function lireReponse(code: string): Promise<Reponse | null> {
  if (import.meta.env.DEV) {
    await attendre(simulation === 'attente' ? 3_600_000 : 700);
    return reponseValide(simulation);
  }

  const resultat = await fetch(`/api/reponse?code=${encodeURIComponent(code)}`, {
    cache: 'no-store',
  });
  if (!resultat.ok) throw new Error(`Lecture refusée (${resultat.status})`);
  return reponseValide((await resultat.json())?.reponse);
}

/**
 * Envoie la réponse. Renvoie la réponse qui fait foi : celle envoyée, ou
 * celle déjà enregistrée si ce lien avait déjà répondu (409).
 */
export async function envoyerReponse(code: string, reponse: Reponse): Promise<Reponse> {
  if (import.meta.env.DEV) {
    await attendre(simulation === 'lent' ? 60_000 : 900);
    if (simulation === 'echec') throw new Error('Échec simulé (développement)');
    console.info(`[développement] Réponse « ${reponse} » simulée pour le code ${code} : rien n'est enregistré.`);
    return reponse;
  }

  const resultat = await fetch('/api/reponse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, reponse }),
  });
  if (resultat.status === 409) {
    const existante = reponseValide((await resultat.json().catch(() => null))?.reponse);
    if (existante) return existante;
  }
  if (!resultat.ok) throw new Error(`Envoi refusé (${resultat.status})`);
  return reponse;
}

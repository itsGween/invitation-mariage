export type Reponse = 'present' | 'absent';

// Envoie la réponse à la fonction serveur api/reponse.ts, qui retrouve le
// nom à partir du code et transmet la réponse par courriel.
export async function envoyerReponse(code: string, reponse: Reponse): Promise<void> {
  // `npm run dev` ne fait pas tourner les fonctions Vercel : envoi simulé,
  // sans appel réseau. ?rsvp=echec simule un échec, ?rsvp=lent un envoi long.
  if (import.meta.env.DEV) {
    const simulation = new URLSearchParams(window.location.search).get('rsvp');
    await new Promise((r) => window.setTimeout(r, simulation === 'lent' ? 60_000 : 900));
    if (simulation === 'echec') throw new Error('Échec simulé (développement)');
    console.info(`[développement] Réponse « ${reponse} » simulée pour le code ${code} : aucun courriel envoyé.`);
    return;
  }

  const resultat = await fetch('/api/reponse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, reponse }),
  });
  if (!resultat.ok) throw new Error(`Envoi refusé (${resultat.status})`);
}

// Réponse mémorisée dans ce navigateur, par invité. Le stockage peut être
// indisponible (navigation privée, données bloquées) : on s'en passe.
const cle = (code: string) => `mariage-reponse-${code}`;

export function reponseMemorisee(code: string): Reponse | null {
  try {
    const valeur = window.localStorage.getItem(cle(code));
    return valeur === 'present' || valeur === 'absent' ? valeur : null;
  } catch {
    return null;
  }
}

export function memoriserReponse(code: string, reponse: Reponse) {
  try {
    window.localStorage.setItem(cle(code), reponse);
  } catch {
    // stockage indisponible
  }
}

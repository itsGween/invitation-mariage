// Registre des réponses (Redis Upstash), partagé par la fonction serveur
// api/reponse.ts et par les scripts d'administration (`npm run reponses`…).
// Jamais importé par le site : les identifiants Redis restent côté serveur.
//
// Clé : l'identifiant dérivé du code (jamais le nom ni le code en clair).
// Valeur : { reponse, date }.

import { Redis } from '@upstash/redis';

export type Reponse = 'present' | 'absent';
export type Enregistrement = { reponse: Reponse; date: string };

const PREFIXE = 'reponse:';
export const cleReponse = (id: string) => `${PREFIXE}${id}`;
export const idDepuisCle = (cle: string) => cle.slice(PREFIXE.length);

/** Client Redis, ou `null` si KV_REST_API_URL / KV_REST_API_TOKEN manquent. */
export function registre(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export function enregistrementValide(valeur: unknown): Enregistrement | null {
  if (!valeur || typeof valeur !== 'object') return null;
  const { reponse, date } = valeur as Record<string, unknown>;
  if (reponse !== 'present' && reponse !== 'absent') return null;
  return { reponse, date: typeof date === 'string' ? date : '' };
}

export async function lireReponse(redis: Redis, id: string): Promise<Enregistrement | null> {
  return enregistrementValide(await redis.get(cleReponse(id)));
}

/**
 * Enregistre la réponse si ce lien n'a pas encore répondu (SET NX, atomique).
 * Renvoie `null` si elle vient d'être enregistrée, sinon la réponse existante.
 */
export async function enregistrerReponse(
  redis: Redis,
  id: string,
  reponse: Reponse,
  instant = new Date(),
): Promise<Enregistrement | null> {
  const valeur: Enregistrement = { reponse, date: instant.toISOString() };
  const resultat = await redis.set(cleReponse(id), valeur, { nx: true });
  if (resultat === 'OK') return null;
  return (await lireReponse(redis, id)) ?? valeur;
}

export async function effacerReponse(redis: Redis, id: string): Promise<boolean> {
  return (await redis.del(cleReponse(id))) > 0;
}

/** Toutes les réponses enregistrées, par identifiant. */
export async function toutesLesReponses(redis: Redis): Promise<Map<string, Enregistrement>> {
  const cles: string[] = [];
  let curseur: string | number = 0;
  do {
    const [suivant, lot]: [string | number, string[]] = await redis.scan(curseur, {
      match: `${PREFIXE}*`,
      count: 500,
    });
    cles.push(...lot);
    curseur = suivant;
  } while (String(curseur) !== '0');

  const resultat = new Map<string, Enregistrement>();
  if (!cles.length) return resultat;
  const valeurs = await redis.mget<unknown[]>(...cles);
  cles.forEach((cle, i) => {
    const enregistrement = enregistrementValide(valeurs[i]);
    if (enregistrement) resultat.set(idDepuisCle(cle), enregistrement);
  });
  return resultat;
}

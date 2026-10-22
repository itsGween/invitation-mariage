// Recherche d'un invité à partir du code de son lien. Partagé par le site
// (navigateur) et par la fonction serveur api/reponse.ts (Node) : Web Crypto
// uniquement, aucune dépendance au DOM ni à React.

import donnees from '../data/invites.json' with { type: 'json' };
import { wedding } from '../config/wedding.ts';
import {
  codeBienForme,
  dechiffrerNom,
  deriver,
  normaliserCode,
  type InviteChiffre,
} from './crypto.ts';

/** Code normalisé, ou `null` s'il est mal formé. */
export function codeValide(brut: unknown): string | null {
  if (typeof brut !== 'string') return null;
  const code = normaliserCode(brut);
  return codeBienForme(code) ? code : null;
}

/** Nom de l'invité tel qu'écrit dans invites.csv, ou `null` si le code est inconnu. */
export async function nomDepuisCode(code: string): Promise<string | null> {
  const { sel, iterations } = wedding.acces;
  const { id, cle } = await deriver(code, sel, iterations);
  const entree = (donnees as InviteChiffre[]).find((e) => e.id === id);
  if (!entree) return null;
  return dechiffrerNom(cle, entree.iv, entree.nom);
}

/** Places prévues par l'invitation, déduites du nom : 2 pour « M. et Mme … », 1 sinon. */
export function nombrePlaces(nom: string): 1 | 2 {
  return /^M\.\s+et\s+Mme\s/.test(nom) ? 2 : 1;
}

// Dérivation et chiffrement partagés par le site (navigateur) et par
// `npm run liens` (Node) : Web Crypto uniquement.

// Majuscules et chiffres, sans 0/O ni 1/I/L.
export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const LONGUEUR_CODE = 8;

export type InviteChiffre = { id: string; iv: string; nom: string };

const encodeur = new TextEncoder();

export function normaliserCode(brut: string): string {
  return brut.trim().toUpperCase();
}

export function codeBienForme(code: string): boolean {
  if (code.length !== LONGUEUR_CODE) return false;
  for (const c of code) if (!ALPHABET.includes(c)) return false;
  return true;
}

export function versBase64(octets: Uint8Array): string {
  let binaire = '';
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire);
}

export function depuisBase64(texte: string): Uint8Array<ArrayBuffer> {
  const binaire = atob(texte);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
  return octets;
}

// 64 octets PBKDF2-SHA-256 : 32 pour l'identifiant de recherche, 32 pour
// la clé AES-GCM.
export async function deriver(
  code: string,
  sel: string,
  iterations: number,
): Promise<{ id: string; cle: CryptoKey }> {
  const base = await crypto.subtle.importKey('raw', encodeur.encode(code), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: encodeur.encode(sel), iterations },
      base,
      512,
    ),
  );
  const cle = await crypto.subtle.importKey('raw', bits.slice(32), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
  return { id: versBase64(bits.slice(0, 32)), cle };
}

export async function chiffrerNom(cle: CryptoKey, nom: string): Promise<{ iv: string; nom: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chiffre = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cle, encodeur.encode(nom));
  return { iv: versBase64(iv), nom: versBase64(new Uint8Array(chiffre)) };
}

export async function dechiffrerNom(cle: CryptoKey, iv: string, nom: string): Promise<string> {
  const clair = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: depuisBase64(iv) },
    cle,
    depuisBase64(nom),
  );
  return new TextDecoder().decode(clair);
}

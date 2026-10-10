import { useEffect, useState } from 'react';
import { wedding } from '../config/wedding.ts';
import donnees from '../data/invites.json';
import {
  codeBienForme,
  dechiffrerNom,
  deriver,
  normaliserCode,
  type InviteChiffre,
} from './crypto.ts';

export type EtatInvite =
  | { etat: 'chargement' }
  | { etat: 'invalide' }
  | { etat: 'ok'; nom: string };

// Espace insécable après « M. », « Mme » et « Abbé » : une civilité ne reste
// jamais seule en fin de ligne.
export function nomAffiche(nom: string): string {
  return nom.replace(/(^|\s)(M\.|Mme|Abbé) /g, '$1$2 ');
}

function codeDansUrl(): string | null {
  const brut = new URLSearchParams(window.location.search).get('i');
  if (!brut) return null;
  const code = normaliserCode(brut);
  return codeBienForme(code) ? code : null;
}

async function chercher(code: string): Promise<string | null> {
  const { sel, iterations } = wedding.acces;
  const { id, cle } = await deriver(code, sel, iterations);
  const entree = (donnees as InviteChiffre[]).find((e) => e.id === id);
  if (!entree) return null;
  return nomAffiche(await dechiffrerNom(cle, entree.iv, entree.nom));
}

export function useInvite(): EtatInvite {
  const [code] = useState(codeDansUrl);
  const [etat, setEtat] = useState<EtatInvite>(code ? { etat: 'chargement' } : { etat: 'invalide' });

  useEffect(() => {
    if (!code) return;
    let annule = false;
    // Web Crypto absent (page servie sans HTTPS) : traité comme un lien invalide.
    chercher(code)
      .catch(() => null)
      .then((nom) => {
        if (!annule) setEtat(nom ? { etat: 'ok', nom } : { etat: 'invalide' });
      });
    return () => {
      annule = true;
    };
  }, [code]);

  return etat;
}

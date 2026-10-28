import { useEffect, useState } from 'react';
import { codeValide, nomDepuisCode } from './invites.ts';

export type EtatInvite =
  | { etat: 'chargement' }
  | { etat: 'invalide' }
  | { etat: 'ok'; nom: string; code: string };

// Espace insécable après les civilités et les titres (« M. », « Mme », « Mlle »,
// « Abbé », « Maître », « Commissaire », « Dr », « Maman ») : une civilité
// ne reste jamais seule en fin de ligne. Affichage uniquement : les messages
// et les courriels gardent l'espace normale.
export function nomAffiche(nom: string): string {
  return nom.replace(/(^|\s)(M\.|Mme|Mlle|Abbé|Maître|Commissaire|Dr|Maman) /g, '$1$2 ');
}

function codeDansUrl(): string | null {
  return codeValide(new URLSearchParams(window.location.search).get('i'));
}

export function useInvite(): EtatInvite {
  const [code] = useState(codeDansUrl);
  const [etat, setEtat] = useState<EtatInvite>(code ? { etat: 'chargement' } : { etat: 'invalide' });

  useEffect(() => {
    if (!code) return;
    let annule = false;
    // Web Crypto absent (page servie sans HTTPS) : traité comme un lien invalide.
    nomDepuisCode(code)
      .catch(() => null)
      .then((nom) => {
        if (annule) return;
        setEtat(nom ? { etat: 'ok', nom: nomAffiche(nom), code } : { etat: 'invalide' });
      });
    return () => {
      annule = true;
    };
  }, [code]);

  return etat;
}

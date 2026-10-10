import type { ReactNode } from 'react';
import { SceauCire } from './SceauCire.tsx';
import './Enveloppe.css';

type Props = {
  monogramme: string;
  /** Lance l'animation d'ouverture (voir ecrans/ouverture.css). */
  ouverte?: boolean;
  /** Contenu de la carte qui sort de l'enveloppe. */
  children?: ReactNode;
};

// Enveloppe dessinée en couches, de l'arrière vers l'avant :
// dos doublé, carte, pans avant, rabat (deux faces), sceau.
export function Enveloppe({ monogramme, ouverte = false, children }: Props) {
  return (
    <div className={`enveloppe${ouverte ? ' enveloppe--ouverte' : ''}`} aria-hidden="true">
      <div className="enveloppe__dos">
        <div className="enveloppe__doublure" />
      </div>
      <div className="enveloppe__carte papier">{children}</div>

      <svg className="enveloppe__devant" viewBox="0 0 300 200" focusable="false">
        <path className="enveloppe__papier" d="M0 0 150 112 300 0V194Q300 200 294 200H6Q0 200 0 194Z" />
        <path className="enveloppe__nuance enveloppe__nuance--gauche" d="M0 0 150 112 0 200Z" />
        <path className="enveloppe__nuance enveloppe__nuance--droite" d="M300 0 150 112 300 200Z" />
        <path className="enveloppe__pan-bas" d="M3 200 143 105Q150 100 157 105L297 200Z" />
        <path className="enveloppe__ombre-rabat" d="M0 2H300L158 123Q150 129 142 123Z" />
      </svg>

      <div className="enveloppe__rabat">
        <div className="enveloppe__rabat-face enveloppe__rabat-face--interieur enveloppe__doublure" />
        <svg
          className="enveloppe__rabat-face enveloppe__rabat-face--exterieur"
          viewBox="0 0 300 200"
          focusable="false"
        >
          <path className="enveloppe__papier" d="M0 0H300L158 117Q150 123 142 117Z" />
          <path className="enveloppe__reflet" d="M0 0H300L158 117Q150 123 142 117Z" />
        </svg>
      </div>

      <SceauCire className="enveloppe__sceau" texte={monogramme} brise={ouverte} />
    </div>
  );
}

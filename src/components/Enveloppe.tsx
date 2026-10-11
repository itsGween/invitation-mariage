import { useId, type ReactNode } from 'react';
import { Illustration } from './Illustration.tsx';
import { SceauCire } from './SceauCire.tsx';
import './Enveloppe.css';

// Tracés dans un repère 300 × 200, étirés aux proportions de l'enveloppe.
const FORME_DEVANT = 'M0 0 150 112 300 0V194Q300 200 294 200H6Q0 200 0 194Z';
const FORME_PAN_BAS = 'M0 200 143 105Q150 100 157 105L300 200Z';
const FORME_RABAT = 'M0 0H300L158 117Q150 123 142 117Z';
const BORD_RABAT = 'M0 0 142 117Q150 123 158 117L300 0';

type Props = {
  /** Lance l'animation d'ouverture (voir ecrans/Ouverture.css). */
  ouverte?: boolean;
  /** Contenu de la carte qui sort de l'enveloppe. */
  children?: ReactNode;
};

// Enveloppe dessinée en couches, de l'arrière vers l'avant :
// dos doublé, carte, pans avant, brindille, rabat (deux faces), sceau.
export function Enveloppe({ ouverte = false, children }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const lumiere = `url(#${id}-lumiere)`;
  const grain = `url(#${id}-grain)`;

  return (
    <div className={`enveloppe${ouverte ? ' enveloppe--ouverte' : ''}`} aria-hidden="true">
      <div className="enveloppe__dos">
        <div className="enveloppe__doublure" />
      </div>
      <div className="enveloppe__carte papier">{children}</div>

      <svg
        className="enveloppe__devant"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          {/* Lumière venant du haut gauche */}
          <linearGradient id={`${id}-lumiere`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="enveloppe__lumiere-claire" />
            <stop offset="0.5" className="enveloppe__lumiere-neutre" />
            <stop offset="1" className="enveloppe__lumiere-sombre" />
          </linearGradient>
          {/* Grain de papier très fin, limité à la forme sur laquelle il est posé */}
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 .98 0 0 0 0 .96 0 0 0 0 .94 .34 0 0 0 -.155" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
          <clipPath id={`${id}-devant`}>
            <path d={FORME_DEVANT} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-devant)`}>
          <path className="enveloppe__pan-cote" d={FORME_DEVANT} />
          <path className="enveloppe__pan-bas" d={FORME_PAN_BAS} />
          <path d={FORME_DEVANT} fill={lumiere} />
          <path d={FORME_DEVANT} filter={grain} />
          <path className="enveloppe__ombre-rabat" d="M0 3H300L158 122Q150 128 142 122Z" />
        </g>
      </svg>

      <Illustration nom="gerbe-roses" className="enveloppe__brindille" sizes="110px" />

      <div className="enveloppe__rabat">
        <div className="enveloppe__rabat-face enveloppe__rabat-face--interieur enveloppe__doublure" />
        <svg
          className="enveloppe__rabat-face enveloppe__rabat-face--exterieur"
          viewBox="0 0 300 200"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path className="enveloppe__rabat-papier" d={FORME_RABAT} />
          <path d={FORME_RABAT} fill={lumiere} />
          <path d={FORME_RABAT} filter={grain} />
          <path className="enveloppe__lisere" d={BORD_RABAT} />
        </svg>
      </div>

      <SceauCire className="enveloppe__sceau" brise={ouverte} />
    </div>
  );
}

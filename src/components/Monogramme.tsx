import { wedding } from '../config/wedding.ts';
import './Monogramme.css';

// Feuilles posées sur le cercle : angle (degrés, 0 = droite, sens horaire) et taille.
const FEUILLES = [
  { angle: 118, taille: 1 },
  { angle: 132, taille: 1.25 },
  { angle: 147, taille: 1 },
  { angle: 160, taille: 0.8 },
  { angle: 20, taille: 0.8 },
  { angle: 33, taille: 1.1 },
  { angle: 47, taille: 0.9 },
  { angle: -62, taille: 0.75 },
];

type Props = { variante?: 'ligne' | 'cercle'; className?: string };

// « ligne » : monogramme de l'en-tête. « cercle » : cercle doré fin orné de
// petites feuilles (écran Lien invalide).
export function Monogramme({ variante = 'ligne', className = '' }: Props) {
  const texte = wedding.maries.monogramme;
  if (variante === 'ligne') {
    const [avant, apres] = texte.split('&');
    return (
      <span className={`monogramme monogramme--ligne script ${className}`}>
        {apres === undefined ? (
          texte
        ) : (
          <>
            {avant}
            <span className="esperluette">&amp;</span>
            {apres}
          </>
        )}
      </span>
    );
  }

  const [haut, ...reste] = texte.split(' ');
  return (
    <svg
      className={`monogramme monogramme--cercle ${className}`}
      viewBox="0 0 120 120"
      role="img"
      aria-label={texte}
    >
      <circle cx="60" cy="60" r="47" className="monogramme__cercle" />
      <path d="M22 88A47 47 0 0 0 98 88" className="monogramme__cercle monogramme__cercle--double" transform="rotate(8 60 60) translate(0 3)" />
      {FEUILLES.map(({ angle, taille }, i) => {
        const a = (angle * Math.PI) / 180;
        const x = 60 + 47 * Math.cos(a);
        const y = 60 + 47 * Math.sin(a);
        // Une feuille sur deux pointe vers l'extérieur du cercle.
        const orientation = angle + (i % 2 ? 50 : 130);
        return (
          <path
            key={angle}
            className="monogramme__feuille"
            d="M0 0C3 -3.500 8 -3.500 11 0C8 3.500 3 3.500 0 0Z"
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${orientation}) scale(${taille})`}
          />
        );
      })}
      <text x="56" y="58" className="monogramme__texte">{haut}</text>
      <text x="64" y="84" className="monogramme__texte">{reste.join(' ')}</text>
    </svg>
  );
}

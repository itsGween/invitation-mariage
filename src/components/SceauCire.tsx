import type { CSSProperties } from 'react';
import sceau from '../assets/illustrations/sceau.webp';
import './SceauCire.css';

// Éclats : position de départ, déplacement et rotation finale
const ECLATS = [
  { x: 50, y: 30, dx: -34, dy: -46, r: -80 },
  { x: 52, y: 44, dx: 44, dy: -30, r: 120 },
  { x: 48, y: 58, dx: -50, dy: 22, r: -140 },
  { x: 53, y: 70, dx: 38, dy: 44, r: 90 },
  { x: 50, y: 50, dx: 60, dy: 6, r: 200 },
  { x: 49, y: 40, dx: -58, dy: -8, r: -60 },
  { x: 51, y: 64, dx: 8, dy: 62, r: 160 },
];

type Props = { brise?: boolean; className?: string };

// Sceau de cire : l'image fournie (monogramme déjà gravé), affichée deux
// fois. À l'ouverture, chaque exemplaire est rogné d'un côté de la ligne de
// cassure (voir SceauCire.css) et les deux moitiés s'écartent.
export function SceauCire({ brise = false, className = '' }: Props) {
  return (
    <div className={`sceau${brise ? ' sceau--brise' : ''} ${className}`} aria-hidden="true">
      <svg className="sceau__eclats" viewBox="0 0 100 100" focusable="false">
        {ECLATS.map((e, i) => (
          <polygon
            key={i}
            points="-3,-2 2,-3 3.5,1 -1,3"
            className="sceau__eclat"
            style={
              {
                '--x': `${e.x}px`,
                '--y': `${e.y}px`,
                '--dx': `${e.dx}px`,
                '--dy': `${e.dy}px`,
                '--r': `${e.r}deg`,
                '--i': i,
              } as CSSProperties
            }
          />
        ))}
      </svg>
      {(['gauche', 'droite'] as const).map((cote) => (
        <img
          key={cote}
          className={`sceau__moitie sceau__moitie--${cote}`}
          src={sceau}
          width={480}
          height={480}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  );
}

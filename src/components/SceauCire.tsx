import { useId, type CSSProperties } from 'react';
import './SceauCire.css';

// Contour irrégulier de la cire : rayon variable autour d'un cercle de 44.
const RAYONS = [46, 44, 47, 45, 43, 47, 46, 44, 47, 45, 44, 47, 45, 46];

function contourCire(): string {
  const points = RAYONS.map((r, i) => {
    const a = (i / RAYONS.length) * Math.PI * 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
  const milieu = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = points.length;
  const depart = milieu(points[n - 1], points[0]);
  let d = `M${depart[0].toFixed(1)} ${depart[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const m = milieu(points[i], points[(i + 1) % n]);
    d += `Q${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}

const CONTOUR = contourCire();
// Ligne de fracture, de haut en bas
const FRACTURE = '53,-5 46,18 55,36 47,54 54,74 48,105';

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

type Props = { texte: string; brise?: boolean; className?: string };

export function SceauCire({ texte, brise = false, className = '' }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  // « MC & P » gravé sur deux lignes : « MC » puis « & P »
  const [haut, ...reste] = texte.split(' ');
  const bas = reste.join(' ');

  return (
    <svg
      className={`sceau${brise ? ' sceau--brise' : ''} ${className}`}
      viewBox="-20 -20 140 140"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-cire`} cx="36%" cy="30%" r="80%">
          <stop offset="0" className="sceau__ton-clair" />
          <stop offset="0.55" className="sceau__ton-moyen" />
          <stop offset="1" className="sceau__ton-fonce" />
        </radialGradient>
        <radialGradient id={`${id}-creux`} cx="60%" cy="68%" r="75%">
          <stop offset="0" className="sceau__ton-clair" />
          <stop offset="0.7" className="sceau__ton-moyen" />
          <stop offset="1" className="sceau__ton-fonce" />
        </radialGradient>
        <g id={`${id}-corps`}>
          <path d={CONTOUR} fill={`url(#${id}-cire)`} />
          <circle cx="50" cy="50" r="33.500" fill={`url(#${id}-creux)`} />
          <circle cx="50" cy="50" r="33.500" className="sceau__anneau" />
          <circle cx="50" cy="50" r="30" className="sceau__filet" />
          <g className="sceau__texte">
            <text x="50.700" y="48.700" className="sceau__relief">{haut}</text>
            <text x="50.700" y="70.700" className="sceau__relief">{bas}</text>
            <text x="50" y="48">{haut}</text>
            <text x="50" y="70">{bas}</text>
          </g>
        </g>
        <clipPath id={`${id}-gauche`}>
          <polygon points={`-20,-20 ${FRACTURE} -20,120`} />
        </clipPath>
        <clipPath id={`${id}-droite`}>
          <polygon points={`120,-20 ${FRACTURE} 120,120`} />
        </clipPath>
      </defs>

      <ellipse cx="51" cy="55" rx="45" ry="44" className="sceau__ombre" />
      <g className="sceau__eclats">
        {ECLATS.map((e, i) => (
          <polygon
            key={i}
            points="-3,-2 2,-3 3.500,1 -1,3"
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
      </g>
      <g className="sceau__moitie sceau__moitie--gauche" clipPath={`url(#${id}-gauche)`}>
        <use href={`#${id}-corps`} />
      </g>
      <g className="sceau__moitie sceau__moitie--droite" clipPath={`url(#${id}-droite)`}>
        <use href={`#${id}-corps`} />
      </g>
    </svg>
  );
}

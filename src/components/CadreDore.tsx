import './CadreDore.css';

// Cadre géométrique : un polygone irrégulier doublé d'un second tracé décalé.
// Le dessin s'étire avec la carte, l'épaisseur des filets reste constante.
export function CadreDore({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`cadre-dore ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="23,5.500 89,7 94.500,21 93.500,75 71,95 15,93.500 6.500,80 7,25" />
      <polygon
        className="cadre-dore__double"
        points="19,7.500 86,4.500 96.500,18 95.500,78 75,93 18,96 8.500,84 4.500,28"
      />
    </svg>
  );
}

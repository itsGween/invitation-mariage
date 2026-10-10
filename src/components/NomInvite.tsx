import { useLayoutEffect, useRef } from 'react';
import './NomInvite.css';

// Part de la taille définie en CSS et la réduit (jusqu'à la moitié) tant que
// le nom déborde en largeur ou dépasse deux lignes.
const REDUCTION_MAX = 0.5;

export function NomInvite({ nom, className = '' }: { nom: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ajuster = () => {
      el.style.fontSize = '';
      el.classList.remove('nom-invite--force');
      let taille = parseFloat(getComputedStyle(el).fontSize);
      const mini = taille * REDUCTION_MAX;
      const deborde = () => {
        const interligne = parseFloat(getComputedStyle(el).lineHeight);
        const lignes = Math.round(el.getBoundingClientRect().height / interligne);
        return el.scrollWidth > el.clientWidth + 1 || lignes > 2;
      };
      while (taille > mini && deborde()) {
        taille -= 1;
        el.style.fontSize = `${taille}px`;
      }
      // Dernier recours : autoriser la coupure à l'intérieur d'un mot.
      if (deborde()) el.classList.add('nom-invite--force');
    };

    ajuster();
    let largeur = el.clientWidth;
    const observateur = new ResizeObserver(() => {
      if (el.clientWidth === largeur) return;
      largeur = el.clientWidth;
      ajuster();
    });
    observateur.observe(el);
    document.fonts?.ready.then(ajuster);
    return () => observateur.disconnect();
  }, [nom]);

  return (
    <span ref={ref} className={`nom-invite script ${className}`}>
      {nom}
    </span>
  );
}

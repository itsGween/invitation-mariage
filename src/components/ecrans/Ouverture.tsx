import { useEffect } from 'react';
import './Ouverture.css';

// Doit rester en phase avec les durées de Ouverture.css.
const DUREE_ANIMATION = 1800;
const DUREE_FONDU = 400;

// L'ouverture se joue sur l'écran Accueil (classes --ouverture / --ouverte) ;
// ce hook prévient quand elle est terminée.
export function useFinOuverture(active: boolean, onFin: () => void) {
  useEffect(() => {
    if (!active) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minuterie = window.setTimeout(onFin, reduit ? DUREE_FONDU : DUREE_ANIMATION);
    return () => window.clearTimeout(minuterie);
  }, [active, onFin]);
}

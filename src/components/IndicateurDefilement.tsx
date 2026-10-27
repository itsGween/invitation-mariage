import { useEffect, useRef, useState } from 'react';
import './IndicateurDefilement.css';

const DELAI_APPARITION = 1500;
const SEUIL_DEFILEMENT = 80;

type Props = {
  /** id de la section signalée (ancre du lien). */
  cible: string;
  libelle: string;
  /** Texte lu par les lecteurs d'écran. */
  description: string;
  className?: string;
};

// Bouton « Faire défiler », placé juste après la carte : il reste collé au
// bas de l'écran tant que la carte dépasse, puis part avec elle. Il mène au
// programme et disparaît dès qu'on fait défiler ; il ne revient pas.
export function IndicateurDefilement({ cible, libelle, description, className = '' }: Props) {
  const [etat, setEtat] = useState<'attente' | 'visible' | 'masque'>('attente');
  const [voile, setVoile] = useState(false);
  const ancre = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const masquer = () => setEtat('masque');

    const surDefilement = () => {
      if (window.scrollY > SEUIL_DEFILEMENT) masquer();
    };
    window.addEventListener('scroll', surDefilement, { passive: true });

    // La section doit entrer franchement dans l'écran : deux blocs seulement
    // bord à bord comptent déjà comme une intersection.
    const section = document.getElementById(cible);
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) masquer();
      },
      { rootMargin: '0px 0px -24px 0px' },
    );
    if (section) observateur.observe(section);

    const minuterie = window.setTimeout(() => {
      // Le voile ivoire ne sert que si l'indicateur recouvre la carte,
      // c'est-à-dire quand celle-ci dépasse le bas de l'écran.
      const carte = ancre.current?.previousElementSibling;
      setVoile(!!carte && carte.getBoundingClientRect().bottom > window.innerHeight + 1);
      setEtat((actuel) => (actuel === 'attente' ? 'visible' : actuel));
    }, DELAI_APPARITION);

    return () => {
      window.removeEventListener('scroll', surDefilement);
      observateur.disconnect();
      window.clearTimeout(minuterie);
    };
  }, [cible]);

  return (
    <div
      ref={ancre}
      className={`indicateur indicateur--${etat}${voile ? ' indicateur--voile' : ''} ${className}`}
    >
      <a className="indicateur__lien" href={`#${cible}`} aria-label={description}>
        <span className="indicateur__libelle">{libelle}</span>
        <svg
          className="indicateur__fleche"
          viewBox="0 0 18 18"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M9 2.500v12.500M3.500 9.500 9 15l5.500-5.500" />
        </svg>
      </a>
    </div>
  );
}

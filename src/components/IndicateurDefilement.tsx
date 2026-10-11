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

// Invite discrète à faire défiler, placée juste après la carte : elle reste
// collée au bas de l'écran tant que la carte dépasse, puis part avec elle.
// Une fois masquée, elle ne revient pas.
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
          className="indicateur__chevron"
          viewBox="0 0 14 14"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2.500 5 7 9.500 11.500 5" />
        </svg>
      </a>
    </div>
  );
}

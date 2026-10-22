import type { ReactNode } from 'react';
import { IconeFleche } from './Icones.tsx';
import './Bouton.css';

type Props = {
  /** principal : or plein, texte ivoire — clair : or clair sur fond vert —
   *  secondaire : contour ivoire sur fond vert — contour : contour or sur fond ivoire */
  variante?: 'principal' | 'clair' | 'secondaire' | 'contour';
  icone?: ReactNode;
  fleche?: boolean;
  children: ReactNode;
  /** Avec `href`, le bouton est rendu comme un lien. */
  href?: string;
  nouvelOnglet?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function Bouton({
  variante = 'principal',
  icone,
  fleche = false,
  children,
  href,
  nouvelOnglet = false,
  onClick,
  disabled = false,
  className = '',
}: Props) {
  const classes = `bouton bouton--${variante} ${className}`;
  const contenu = (
    <>
      {icone && <span className="bouton__icone">{icone}</span>}
      <span>{children}</span>
      {fleche && <IconeFleche className="bouton__fleche" />}
    </>
  );

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        onClick={onClick}
        {...(nouvelOnglet ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {contenu}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {contenu}
    </button>
  );
}

import { dateAffichee } from '../lib/date.ts';
import './BlocDate.css';

// SAMEDI | 14 | NOVEMBRE, puis l'année.
export function BlocDate({ className = '' }: { className?: string }) {
  return (
    <p className={`bloc-date ${className}`}>
      <time dateTime={dateAffichee.iso} className="bloc-date__date">
        <span className="bloc-date__cote capitales">{dateAffichee.jourSemaine}</span>
        <span className="bloc-date__jour">{dateAffichee.jour}</span>
        <span className="bloc-date__cote capitales">{dateAffichee.mois}</span>
        <span className="bloc-date__annee">{dateAffichee.annee}</span>
      </time>
    </p>
  );
}

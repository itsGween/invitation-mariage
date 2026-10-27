import { wedding } from '../config/wedding.ts';
import './PiedDePage.css';

// Crédit discret tout en bas de l'invitation ouverte (jamais sur l'accueil
// ni sur la page « invitation personnelle »).
export function PiedDePage() {
  const { credit } = wedding;

  return (
    <footer className="pied papier">
      <p className="pied__auteur">{credit.auteur}</p>
      <p className="pied__offre">{credit.offre}</p>
      <p className="pied__courriel">
        <a href={`mailto:${credit.courriel}?subject=${encodeURIComponent(credit.objet)}`}>
          {credit.courriel}
        </a>
      </p>
    </footer>
  );
}

import { wedding } from '../../config/wedding.ts';
import { Bouton } from '../Bouton.tsx';
import { Enveloppe } from '../Enveloppe.tsx';
import { Illustration } from '../Illustration.tsx';
import './Accueil.css';

type Props = {
  /** Faux pendant la dérivation du code : le bouton reste inactif. */
  pret: boolean;
  ouverture: boolean;
  onOuvrir: () => void;
};

// Prénoms, couple sous l'arche, enveloppe fermée posée devant le bas du
// dessin, bouton. Le tout tient dans l'écran, sans défilement.
export function Accueil({ pret, ouverture, onOuvrir }: Props) {
  const { maries, ouverture: carte } = wedding;

  return (
    <main className={`accueil papier${ouverture ? ' accueil--ouverture' : ''}`}>
      <Illustration
        nom="bouquet-haut-gauche"
        className="accueil__decor accueil__decor--haut"
        sizes="(min-width: 1024px) 320px, 46vw"
      />
      <Illustration
        nom="bouquet-bas-droite"
        className="accueil__decor accueil__decor--bas"
        sizes="(min-width: 1024px) 320px, 46vw"
      />

      <div className="accueil__contenu">
        <h1 className="accueil__titre script">
          <span>{maries.elle}</span>
          <span>
            <span className="esperluette">&amp;</span> {maries.lui}
          </span>
        </h1>

        <div className="accueil__scene">
          <Illustration
            nom="couple-arche"
            className="accueil__couple"
            sizes="(min-width: 1024px) 400px, 60vw"
            alt={`${maries.elle} et ${maries.lui} sous une arche dorée`}
          />
          <Enveloppe ouverte={ouverture}>
            <p className="accueil__carte">
              <span className="accueil__bienvenue script">{carte.titre}</span>
              <span>{carte.sousTitre}</span>
            </p>
          </Enveloppe>
        </div>

        <Bouton fleche onClick={onOuvrir} disabled={!pret || ouverture} className="accueil__bouton">
          Ouvrir mon invitation
        </Bouton>
      </div>
    </main>
  );
}

import { wedding } from '../../config/wedding.ts';
import { Bouton } from '../Bouton.tsx';
import { Enveloppe } from '../Enveloppe.tsx';
import { Illustration } from '../Illustration.tsx';
import { NomInvite } from '../NomInvite.tsx';
import './Accueil.css';

type Props = {
  /** `null` pendant la dérivation du code : l'enveloppe s'affiche sans nom. */
  nom: string | null;
  ouverture: boolean;
  onOuvrir: () => void;
};

export function Accueil({ nom, ouverture, onOuvrir }: Props) {
  return (
    <main className={`accueil papier${ouverture ? ' accueil--ouverture' : ''}`}>
      <Illustration
        nom="gerbe-doree"
        miroir
        className="accueil__decor accueil__decor--haut"
        sizes="(min-width: 1024px) 340px, 200px"
      />
      <Illustration
        nom="gerbe-roses"
        miroir
        className="accueil__decor accueil__decor--bas"
        sizes="(min-width: 1024px) 250px, 140px"
      />

      <div className="accueil__contenu">
        <h1 className="accueil__adresse">
          {nom && (
            <>
              <span className="accueil__pour script">Pour</span>
              <NomInvite nom={nom} className="accueil__nom" />
            </>
          )}
        </h1>

        <Enveloppe monogramme={wedding.maries.monogramme} ouverte={ouverture}>
          {nom && (
            <p className="accueil__carte">
              <span>Bonjour</span>
              <span className="accueil__carte-nom script">{nom},</span>
              <span>Nous avons la joie de vous inviter…</span>
            </p>
          )}
        </Enveloppe>

        <Bouton fleche onClick={onOuvrir} disabled={!nom || ouverture} className="accueil__bouton">
          Ouvrir mon invitation
        </Bouton>
      </div>
    </main>
  );
}

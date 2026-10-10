import { wedding } from '../../config/wedding.ts';
import { Illustration } from '../Illustration.tsx';
import { Monogramme } from '../Monogramme.tsx';
import { Separateur } from '../Separateur.tsx';
import './LienInvalide.css';

// Aucun lien vers l'invitation depuis cet écran.
export function LienInvalide() {
  return (
    <main className="lien-invalide papier">
      <Illustration
        nom="gerbe-doree"
        miroir
        className="lien-invalide__decor lien-invalide__decor--haut"
        sizes="(min-width: 1024px) 280px, 170px"
      />
      <Illustration
        nom="gerbe-roses"
        miroir
        className="lien-invalide__decor lien-invalide__decor--bas"
        sizes="(min-width: 1024px) 270px, 170px"
      />

      <div className="lien-invalide__contenu">
        <Monogramme variante="cercle" className="lien-invalide__monogramme" />
        <h1 className="lien-invalide__titre">{wedding.lienInvalide.titre}</h1>
        <Separateur />
        <p className="lien-invalide__texte">{wedding.lienInvalide.texte}</p>
      </div>
    </main>
  );
}

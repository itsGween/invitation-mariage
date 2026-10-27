import { wedding, type Icone } from '../../config/wedding.ts';
import { Bouton } from '../Bouton.tsx';
import { IconeCouverts, IconeEglise } from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import './Programme.css';

const ICONES: Record<Icone, typeof IconeEglise> = {
  eglise: IconeEglise,
  couverts: IconeCouverts,
};

// Fond vert forêt : une carte par événement (heure, lieu, itinéraire).
export function Programme() {
  const { programme } = wedding;

  return (
    <section id="programme" className="programme panneau-vert" aria-labelledby="programme-titre">
      <Illustration
        nom="gerbe-doree"
        className="programme__decor programme__decor--haut"
        sizes="(min-width: 1024px) 150px, 160px"
      />
      <Illustration
        nom="gerbe-doree"
        miroir
        className="programme__decor programme__decor--bas"
        sizes="(min-width: 1024px) 150px, 160px"
      />

      <div className="programme__contenu">
        <h2 id="programme-titre" className="programme__titre script">
          {programme.titre}
        </h2>
        <ul className="programme__cartes">
          {programme.etapes.map((etape) => {
            const Icone = ICONES[etape.icone];
            return (
              <li key={etape.titre} className="programme__carte">
                <Icone className="programme__icone" />
                <h3 className="programme__intitule">{etape.titre}</h3>
                <p className="programme__heure">{etape.heure}</p>
                <p className="programme__lieu">{etape.lieu}</p>
                <p className="programme__adresse">{etape.adresse}</p>
                <Bouton
                  variante="clair"
                  href={etape.lien}
                  nouvelOnglet
                  fleche
                  className="programme__bouton"
                >
                  {programme.bouton}
                  <span className="sr-only"> : {etape.titre} (nouvel onglet)</span>
                </Bouton>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

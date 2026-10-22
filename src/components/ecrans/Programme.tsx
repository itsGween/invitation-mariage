import { wedding, type Icone } from '../../config/wedding.ts';
import { Bouton } from '../Bouton.tsx';
import { IconeCouverts, IconeEglise } from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import { Separateur } from '../Separateur.tsx';
import './Programme.css';

const ICONES: Record<Icone, typeof IconeEglise> = {
  eglise: IconeEglise,
  couverts: IconeCouverts,
};

// Fond vert forêt : le programme de la journée, puis les itinéraires.
export function Programme() {
  const { programme, itineraires } = wedding;

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
        <ul className="programme__etapes">
          {programme.etapes.map((etape) => {
            const Icone = ICONES[etape.icone];
            return (
              <li key={etape.heure} className="programme__etape">
                <Icone className="programme__icone" />
                <span className="programme__heure">{etape.heure}</span>
                <span>
                  <strong className="programme__intitule">{etape.titre}</strong>
                  <span className="programme__lieu">{etape.lieu}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <Separateur className="programme__separateur" />

        <h2 id="itineraires" className="programme__titre script">
          {itineraires.titre}
        </h2>
        <ul className="programme__lieux">
          {itineraires.lieux.map((lieu) => {
            const Icone = ICONES[lieu.icone];
            return (
              <li key={lieu.titre} className="programme__carte">
                <Icone className="programme__icone" />
                <div className="programme__carte-texte">
                  <strong className="programme__intitule">{lieu.titre}</strong>
                  {lieu.lignes.map((ligne) => (
                    <span key={ligne} className="programme__lieu">
                      {ligne}
                    </span>
                  ))}
                </div>
                <Bouton
                  variante="clair"
                  href={lieu.lien}
                  nouvelOnglet
                  fleche
                  className="programme__bouton"
                >
                  {itineraires.bouton}
                  <span className="sr-only"> : {lieu.titre} (nouvel onglet)</span>
                </Bouton>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

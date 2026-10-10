import { wedding, type IconeProgramme } from '../../config/wedding.ts';
import { telechargerIcs } from '../../lib/ics.ts';
import { Bouton } from '../Bouton.tsx';
import {
  IconeCalendrier,
  IconeCourriel,
  IconeCouverts,
  IconeEglise,
  IconeRepere,
  IconeTelephone,
  OrnementFeuille,
} from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import './Details.css';

const ICONES: Record<IconeProgramme, typeof IconeEglise> = {
  eglise: IconeEglise,
  couverts: IconeCouverts,
};

export function Details() {
  const { programme, tenue, contact, itineraire } = wedding;

  return (
    <section id="details" className="details" aria-labelledby="details-titre">
      <Illustration
        nom="gerbe-doree"
        miroir
        className="details__decor"
        sizes="(min-width: 1024px) 150px, 170px"
      />

      <div className="details__contenu">
        <header className="details__entete">
          <h2 id="details-titre" className="details__titre script">
            Détails
          </h2>
          <OrnementFeuille className="details__ornement" />
        </header>

        <section className="details__bloc" aria-labelledby="details-programme">
          <h3 id="details-programme" className="details__sous-titre script">
            Le programme
          </h3>
          <ul className="details__programme">
            {programme.map((etape) => {
              const Icone = ICONES[etape.icone];
              return (
                <li key={etape.heure} className="details__etape">
                  <Icone className="details__icone" />
                  <span className="details__heure">{etape.heure}</span>
                  <span>
                    <strong className="details__intitule">{etape.titre}</strong>
                    {etape.lieu.map((ligne) => (
                      <span key={ligne} className="details__lieu">
                        {ligne}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="details__bloc" aria-labelledby="details-tenue">
          <h3 id="details-tenue" className="details__sous-titre script">
            Le code vestimentaire
          </h3>
          <div className="details__tenue">
            <span className="details__pastilles" aria-hidden="true">
              <span className="details__pastille details__pastille--sauge" />
              <span className="details__pastille details__pastille--blush" />
            </span>
            <p>{tenue}</p>
          </div>
        </section>

        <section className="details__bloc" aria-labelledby="details-contact">
          <h3 id="details-contact" className="details__sous-titre script">
            Nous contacter
          </h3>
          <ul className="details__contacts">
            <li>
              <a className="details__contact" href={`mailto:${contact.courriel}`}>
                <IconeCourriel className="details__icone-contact" />
                {contact.courriel}
              </a>
            </li>
            <li>
              <a className="details__contact" href={`tel:${contact.telephone.replace(/[^+\d]/g, '')}`}>
                <IconeTelephone className="details__icone-contact" />
                {contact.telephone}
              </a>
            </li>
          </ul>
        </section>

        <div className="details__actions">
          <Bouton href={itineraire} nouvelOnglet icone={<IconeRepere />} fleche>
            Voir l'itinéraire
          </Bouton>
          <Bouton variante="secondaire" icone={<IconeCalendrier />} onClick={telechargerIcs}>
            Ajouter au calendrier
          </Bouton>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { wedding } from '../../config/wedding.ts';
import { envoyerReponse, lireReponse, type Reponse } from '../../lib/reponse.ts';
import { Bouton } from '../Bouton.tsx';
import { nombrePlaces } from '../../lib/invites.ts';
import { IconeTelephone } from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import { Separateur } from '../Separateur.tsx';
import './Confirmation.css';

type Etat =
  | { etape: 'attente' | 'erreurLecture' | 'choix' }
  | { etape: 'demande' | 'envoi' | 'echec' | 'final'; reponse: Reponse };

// La réponse est définitive pour ce lien : le serveur (api/reponse.ts) fait
// foi. Au chargement, on lui demande si ce lien a déjà répondu ; avant tout
// envoi, l'invité confirme son choix dans la page.
export function Confirmation({ code, nom }: { code: string; nom: string }) {
  const { confirmation: t, contacts } = wedding;
  const [etat, setEtat] = useState<Etat>({ etape: 'attente' });
  const zone = useRef<HTMLDivElement>(null);

  // Le focus suit le contenu qui remplace le bouton activé.
  const focaliser = (selecteur: string) =>
    window.requestAnimationFrame(() => zone.current?.querySelector<HTMLElement>(selecteur)?.focus());

  const verifier = useCallback(() => {
    let annule = false;
    setEtat({ etape: 'attente' });
    lireReponse(code)
      .then((reponse) => {
        if (!annule) setEtat(reponse ? { etape: 'final', reponse } : { etape: 'choix' });
      })
      .catch(() => {
        if (!annule) setEtat({ etape: 'erreurLecture' });
      });
    return () => {
      annule = true;
    };
  }, [code]);

  useEffect(verifier, [verifier]);

  function demander(reponse: Reponse) {
    setEtat({ etape: 'demande', reponse });
    focaliser('.confirmation__demande button');
  }

  function annuler() {
    setEtat({ etape: 'choix' });
    focaliser('button');
  }

  async function confirmer(reponse: Reponse) {
    setEtat({ etape: 'envoi', reponse });
    try {
      // En cas de 409, c'est la réponse déjà enregistrée qui s'affiche.
      setEtat({ etape: 'final', reponse: await envoyerReponse(code, reponse) });
    } catch {
      setEtat({ etape: 'echec', reponse });
    }
  }

  const present = 'reponse' in etat && etat.reponse === 'present';
  // Annonce des changements d'état aux lecteurs d'écran
  const annonce = {
    attente: '',
    choix: '',
    envoi: t.envoi,
    erreurLecture: t.erreurLecture,
    demande: present ? t.demandePresent : t.demandeAbsent,
    echec: t.echec,
    final: `${present ? t.merciPresent : t.merciAbsent} ${present ? t.rappelPresent : t.rappelAbsent}`,
  }[etat.etape];

  return (
    <section id="confirmation" className="confirmation panneau-vert" aria-labelledby="confirmation-titre">
      <Illustration
        nom="gerbe-doree"
        className="confirmation__decor confirmation__decor--vert"
        sizes="160px"
      />
      <Illustration
        nom="bouquet-haut-gauche"
        className="confirmation__decor confirmation__decor--fleurs-haut"
        sizes="(min-width: 1024px) 200px, 1px"
      />
      <Illustration
        nom="bouquet-bas-droite"
        className="confirmation__decor confirmation__decor--fleurs-bas"
        sizes="(min-width: 1024px) 200px, 1px"
      />

      <div className="confirmation__contenu">
        <h2 id="confirmation-titre" className="confirmation__titre script">
          {t.titre}
        </h2>
        <Separateur className="confirmation__separateur" />
        <p className="confirmation__texte">{t.texte}</p>
        <p className="confirmation__places">
          {nombrePlaces(nom) === 2 ? t.placesDeux : t.placesUne}
        </p>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {annonce}
        </p>

        <div ref={zone} className="confirmation__reponse">
          {etat.etape === 'attente' && (
            <p className="confirmation__attente">
              <span className="confirmation__points" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="sr-only">{t.attente}</span>
            </p>
          )}

          {etat.etape === 'erreurLecture' && (
            <>
              <p className="confirmation__message">{t.erreurLecture}</p>
              <Bouton variante="clair" onClick={verifier} className="confirmation__bouton">
                {t.reessayer}
              </Bouton>
            </>
          )}

          {etat.etape === 'choix' && (
            <div className="confirmation__boutons">
              {(['present', 'absent'] as const).map((reponse) => (
                <Bouton
                  key={reponse}
                  variante={reponse === 'present' ? 'clair' : 'secondaire'}
                  fleche={reponse === 'present'}
                  onClick={() => demander(reponse)}
                  className="confirmation__bouton"
                >
                  {reponse === 'present' ? t.boutonPresent : t.boutonAbsent}
                </Bouton>
              ))}
            </div>
          )}

          {(etat.etape === 'demande' || etat.etape === 'envoi') && (
            <div
              className="confirmation__demande"
              role="group"
              aria-labelledby="confirmation-demande"
            >
              <p id="confirmation-demande" className="confirmation__question">
                {present ? t.demandePresent : t.demandeAbsent}
              </p>
              <div className="confirmation__boutons">
                <Bouton
                  variante="clair"
                  disabled={etat.etape === 'envoi'}
                  onClick={() => confirmer(etat.reponse)}
                  className="confirmation__bouton"
                >
                  {etat.etape === 'envoi' ? t.envoi : t.oui}
                </Bouton>
                <Bouton
                  variante="secondaire"
                  disabled={etat.etape === 'envoi'}
                  onClick={annuler}
                  className="confirmation__bouton"
                >
                  {t.annuler}
                </Bouton>
              </div>
            </div>
          )}

          {etat.etape === 'echec' && (
            <>
              <p className="confirmation__message">{t.echec}</p>
              <Bouton
                variante="clair"
                onClick={() => confirmer(etat.reponse)}
                className="confirmation__bouton"
              >
                {t.reessayer}
              </Bouton>
            </>
          )}

          {etat.etape === 'final' && (
            <>
              <p className="confirmation__merci">{present ? t.merciPresent : t.merciAbsent}</p>
              <div className="confirmation__recapitulatif">
                <p className="confirmation__votre-reponse">
                  {present ? t.rappelPresent : t.rappelAbsent}
                </p>
                <p className="confirmation__changement">
                  {t.changement}
                </p>
              </div>
            </>
          )}
        </div>

        <div id="contacts" className="confirmation__contacts-bloc">
          <h2 className="confirmation__titre confirmation__titre--contact script">
            {contacts.titre}
          </h2>
          <p className="confirmation__joignables">{contacts.sousTitre}</p>
          <ul className="confirmation__contacts">
            {contacts.telephones.map((tel) => (
              <li key={tel.numero} className="confirmation__ligne-contact">
                <a className="confirmation__contact" href={tel.appel}>
                  <IconeTelephone className="confirmation__icone-contact" />
                  <span className="confirmation__telephone">{tel.numero}</span>
                </a>
                <a
                  className="confirmation__whatsapp"
                  href={tel.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contacts.whatsapp}
                  <span className="sr-only"> : {tel.numero} (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

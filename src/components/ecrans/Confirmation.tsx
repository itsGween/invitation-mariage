import { useRef, useState } from 'react';
import { wedding } from '../../config/wedding.ts';
import {
  envoyerReponse,
  memoriserReponse,
  reponseMemorisee,
  type Reponse,
} from '../../lib/reponse.ts';
import { Bouton } from '../Bouton.tsx';
import { nombrePlaces } from '../../lib/invites.ts';
import { IconeCourriel, IconeTelephone } from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import { Separateur } from '../Separateur.tsx';
import './Confirmation.css';

type Etat =
  | { etape: 'choix' }
  | { etape: 'envoi' | 'merci' | 'rappel' | 'echec'; reponse: Reponse };

// Un appui envoie immédiatement la réponse par courriel (api/reponse.ts).
// La réponse est mémorisée dans le navigateur pour les visites suivantes.
export function Confirmation({ code, nom }: { code: string; nom: string }) {
  const { confirmation: t, contact } = wedding;
  const [etat, setEtat] = useState<Etat>(() => {
    const memorisee = reponseMemorisee(code);
    return memorisee ? { etape: 'rappel', reponse: memorisee } : { etape: 'choix' };
  });
  const choix = useRef<HTMLDivElement>(null);

  async function repondre(reponse: Reponse) {
    setEtat({ etape: 'envoi', reponse });
    try {
      await envoyerReponse(code, reponse);
      memoriserReponse(code, reponse);
      setEtat({ etape: 'merci', reponse });
    } catch {
      setEtat({ etape: 'echec', reponse });
    }
  }

  function modifier() {
    setEtat({ etape: 'choix' });
    // Le focus passe au premier bouton, réaffiché à la place du lien.
    window.requestAnimationFrame(() => choix.current?.querySelector('button')?.focus());
  }

  const envoi = etat.etape === 'envoi';
  const present = 'reponse' in etat && etat.reponse === 'present';
  const message = {
    choix: null,
    envoi: <span className="sr-only">{t.envoi}</span>,
    merci: present ? t.merciPresent : t.merciAbsent,
    rappel: present ? t.rappelPresent : t.rappelAbsent,
    echec: t.echec,
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

        <div className="confirmation__reponse">
          {(etat.etape === 'choix' || envoi) && (
            <div ref={choix} className="confirmation__boutons">
              {(['present', 'absent'] as const).map((reponse) => (
                <Bouton
                  key={reponse}
                  variante={reponse === 'present' ? 'clair' : 'secondaire'}
                  fleche={reponse === 'present' && !envoi}
                  disabled={envoi}
                  onClick={() => repondre(reponse)}
                  className="confirmation__bouton"
                >
                  {envoi && etat.reponse === reponse
                    ? t.envoi
                    : reponse === 'present'
                      ? t.boutonPresent
                      : t.boutonAbsent}
                </Bouton>
              ))}
            </div>
          )}

          {/* Messages d'état annoncés par les lecteurs d'écran */}
          <div aria-live="polite" aria-atomic="true">
            {message && (
              <p className={`confirmation__message confirmation__message--${etat.etape}`}>{message}</p>
            )}
          </div>

          {(etat.etape === 'merci' || etat.etape === 'rappel') && (
            <button type="button" className="confirmation__modifier" onClick={modifier}>
              {t.modifier}
            </button>
          )}
          {etat.etape === 'echec' && (
            <Bouton
              variante="clair"
              onClick={() => repondre(etat.reponse)}
              className="confirmation__bouton"
            >
              {t.reessayer}
            </Bouton>
          )}
        </div>

        <h2 className="confirmation__titre confirmation__titre--contact script">{contact.titre}</h2>
        <ul className="confirmation__contacts">
          <li>
            <a className="confirmation__contact" href={`mailto:${contact.courriel}`}>
              <IconeCourriel className="confirmation__icone-contact" />
              {contact.courriel}
            </a>
          </li>
          <li>
            <a
              className="confirmation__contact"
              href={`tel:${contact.telephone.replace(/[^+\d]/g, '')}`}
            >
              <IconeTelephone className="confirmation__icone-contact" />
              <span className="confirmation__telephone">{contact.telephone}</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

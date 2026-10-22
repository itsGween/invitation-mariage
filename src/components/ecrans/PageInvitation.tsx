import { useEffect, useRef } from 'react';
import { wedding, type Direction } from '../../config/wedding.ts';
import { BlocDate } from '../BlocDate.tsx';
import { Bouton } from '../Bouton.tsx';
import { Illustration } from '../Illustration.tsx';
import { IndicateurDefilement } from '../IndicateurDefilement.tsx';
import { Monogramme } from '../Monogramme.tsx';
import { Confirmation } from './Confirmation.tsx';
import { Invitation } from './Invitation.tsx';
import { Programme } from './Programme.tsx';
import './PageInvitation.css';

type Props = { nom: string; code: string; direction: Direction };

// Mobile : carte Invitation, Programme et itinéraires, Confirmation, en
// défilement. Ordinateur : en-tête fin puis quatre colonnes (invitation,
// couple et date, programme, confirmation).
export function PageInvitation({ nom, code, direction }: Props) {
  const principal = useRef<HTMLElement>(null);
  const { navigation, maries, indicateur } = wedding;

  // Après l'ouverture de l'enveloppe, le focus suit le contenu.
  useEffect(() => {
    principal.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div id="accueil" className="page papier entree-fondu">
      <header className="page__entete">
        <a href="#accueil" className="page__monogramme" aria-label={maries.monogramme}>
          <Monogramme />
        </a>
        <nav className="page__ancres" aria-label="Sections">
          <a href="#accueil">{navigation.accueil}</a>
          <a href="#invitation">{navigation.invitation}</a>
          <a href="#programme">{navigation.programme}</a>
          <a href="#itineraires">{navigation.itineraires}</a>
          <a href="#confirmation">{navigation.confirmation}</a>
        </nav>
        <Bouton variante="contour" href="#confirmation" className="page__bouton-entete">
          {navigation.bouton}
        </Bouton>
      </header>

      <main ref={principal} tabIndex={-1} className="page__colonnes">
        <Invitation nom={nom} direction={direction} />
        <IndicateurDefilement
          cible="programme"
          libelle={indicateur.libelle}
          description={indicateur.description}
          className={`indicateur--direction-${direction.toLowerCase()}`}
        />
        <div className="page__couple">
          <Illustration
            nom="couple-arche"
            className="page__couple-image"
            sizes="(min-width: 1024px) 24vw, 1px"
          />
          <BlocDate className="page__date" />
        </div>
        <Programme />
        <Confirmation code={code} />
      </main>
    </div>
  );
}

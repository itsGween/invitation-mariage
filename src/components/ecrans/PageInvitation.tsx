import { useEffect, useRef } from 'react';
import { wedding, type Direction } from '../../config/wedding.ts';
import { Illustration } from '../Illustration.tsx';
import { IndicateurDefilement } from '../IndicateurDefilement.tsx';
import { Monogramme } from '../Monogramme.tsx';
import { Separateur } from '../Separateur.tsx';
import { Details } from './Details.tsx';
import { Invitation } from './Invitation.tsx';
import './PageInvitation.css';

type Props = { nom: string; direction: Direction };

// Mobile : carte Invitation puis Détails, en défilement.
// Ordinateur : en-tête fin puis trois colonnes (accroche, carte, Détails).
export function PageInvitation({ nom, direction }: Props) {
  const principal = useRef<HTMLElement>(null);

  // Après l'ouverture de l'enveloppe, le focus suit le contenu.
  useEffect(() => {
    principal.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="page papier entree-fondu">
      <Illustration
        nom="gerbe-doree"
        miroir
        className="page__decor page__decor--haut"
        sizes="(min-width: 1024px) 260px, 1px"
      />
      <Illustration
        nom="gerbe-roses"
        miroir
        className="page__decor page__decor--bas"
        sizes="(min-width: 1024px) 230px, 1px"
      />

      <header className="page__entete">
        <a href="#invitation" className="page__monogramme" aria-label={wedding.maries.monogramme}>
          <Monogramme />
        </a>
        <nav className="page__ancres" aria-label="Sections">
          <a href="#invitation">Invitation</a>
          <a href="#details">Détails</a>
        </nav>
      </header>

      <main ref={principal} tabIndex={-1} className="page__colonnes">
        <aside className="page__accroche">
          <p className="page__accroche-titre script">{wedding.accroche.titre}</p>
          <Separateur />
          <p className="page__accroche-texte">{wedding.accroche.texte}</p>
        </aside>
        <Invitation nom={nom} direction={direction} />
        <IndicateurDefilement
          cible="details"
          libelle="Détails"
          description="Voir les détails"
          className={`indicateur--direction-${direction.toLowerCase()}`}
        />
        <Details />
      </main>
    </div>
  );
}

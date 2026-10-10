import { wedding, type Direction } from '../../config/wedding.ts';
import { dateAffichee } from '../../lib/date.ts';
import { CadreDore } from '../CadreDore.tsx';
import { IconeCoeur } from '../Icones.tsx';
import { Illustration } from '../Illustration.tsx';
import './Invitation.css';

// Direction B : quelques éclaboussures dorées, hors de la zone de texte.
const ECLABOUSSURES = [
  [70, 4.500, 0.9], [76, 7, 0.5], [82, 5, 1.2], [88, 9, 0.6], [92, 4, 0.8], [85, 13, 0.4],
  [94, 15, 1], [79, 11, 0.35], [8, 88, 1.1], [14, 92, 0.5], [20, 95, 0.9], [11, 96, 0.4],
  [27, 91, 0.6], [5, 82, 0.7], [33, 96, 0.45], [4, 46, 0.5], [6.500, 50, 0.8], [95, 55, 0.6],
  [93, 60, 0.4],
];

type Props = { nom: string; direction: Direction };

export function Invitation({ nom, direction }: Props) {
  const { maries, lieu, heure } = wedding;

  return (
    <section
      id="invitation"
      className={`invitation invitation--${direction.toLowerCase()} papier`}
      aria-labelledby="invitation-titre"
    >
      {direction === 'A' ? (
        <>
          <CadreDore className="invitation__cadre" />
          <Illustration
            nom="bouquet-haut-gauche"
            className="invitation__decor invitation__decor--haut"
            sizes="(min-width: 1024px) 290px, (min-width: 480px) 310px, 64vw"
          />
          <Illustration
            nom="bouquet-bas-droite"
            className="invitation__decor invitation__decor--bas"
            sizes="(min-width: 1024px) 290px, (min-width: 480px) 310px, 64vw"
          />
        </>
      ) : (
        <>
          <svg
            className="invitation__eclaboussures"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {ECLABOUSSURES.map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={r * 0.55} ry={r * 0.28} opacity={0.45 + (i % 3) * 0.2} />
            ))}
          </svg>
          <Illustration
            nom="gerbe-roses"
            miroir
            className="invitation__decor invitation__decor--haut"
            sizes="(min-width: 1024px) 170px, (min-width: 480px) 185px, 38vw"
          />
          <Illustration
            nom="gerbe-doree"
            miroir
            className="invitation__decor invitation__decor--bas"
            sizes="(min-width: 1024px) 220px, (min-width: 480px) 240px, 50vw"
          />
        </>
      )}

      <div className="invitation__contenu">
        <p className="invitation__bonjour">Bonjour {nom},</p>
        <p className="invitation__intro">
          Nous avons la joie de vous inviter
          <br />
          au mariage de
        </p>

        <h1 id="invitation-titre" className="invitation__maries script">
          <span>{maries.elle}</span>
          <span className="invitation__et">&amp;</span>
          <span>{maries.lui}</span>
        </h1>

        <p className="invitation__quand">
          <time dateTime={dateAffichee.iso} className="invitation__date">
            <span className="invitation__date-cote capitales">{dateAffichee.jourSemaine}</span>
            <span className="invitation__jour">{dateAffichee.jour}</span>
            <span className="invitation__date-cote capitales">{dateAffichee.mois}</span>
            <span className="invitation__annee">{dateAffichee.annee}</span>
          </time>
          <span className="invitation__heure">{heure}</span>
        </p>

        <IconeCoeur className="invitation__coeur" />

        <h2 className="invitation__lieu script">{lieu.nom}</h2>
        <p className="invitation__adresse">
          {lieu.salle}
          <br />
          {lieu.adresse}
          <br />
          {lieu.ville}
        </p>
      </div>
    </section>
  );
}

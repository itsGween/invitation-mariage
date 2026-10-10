const urls = import.meta.glob<string>('../assets/illustrations/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Dimensions réelles des fichiers fournis : [largeur, hauteur] en -600 puis en 1000.
const DIMENSIONS = {
  'bouquet-haut-gauche': { petit: [600, 599], grand: [1000, 998] },
  'bouquet-bas-droite': { petit: [595, 600], grand: [991, 1000] },
  'gerbe-roses': { petit: [419, 600], grand: [698, 1000] },
  'gerbe-doree': { petit: [600, 448], grand: [1000, 746] },
} as const;

export type NomIllustration = keyof typeof DIMENSIONS;

const url = (fichier: string) => urls[`../assets/illustrations/${fichier}.webp`];

type Props = {
  nom: NomIllustration;
  /** Largeur affichée, au format de l'attribut `sizes`. */
  sizes: string;
  className?: string;
  /** Retournement horizontal (scaleX(-1)). */
  miroir?: boolean;
};

export function Illustration({ nom, sizes, className = '', miroir = false }: Props) {
  const { petit, grand } = DIMENSIONS[nom];
  return (
    <img
      className={`illustration${miroir ? ' illustration--miroir' : ''} ${className}`}
      src={url(`${nom}-600`)}
      srcSet={`${url(`${nom}-600`)} ${petit[0]}w, ${url(nom)} ${grand[0]}w`}
      sizes={sizes}
      width={petit[0]}
      height={petit[1]}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
    />
  );
}

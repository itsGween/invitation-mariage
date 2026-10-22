import type { ReactNode, SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

function Trait({ children, ...props }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconeFleche = (p: Props) => (
  <Trait {...p}>
    <path d="M4 12h16M14.500 6.500 20 12l-5.500 5.500" />
  </Trait>
);

export const IconeEglise = (p: Props) => (
  <Trait {...p}>
    <path d="M12 2v5M10 3.800h4M12 7l-4 3.500V21h8V10.500L12 7zM8 14l-5 3v4h5M16 14l5 3v4h-5" />
    <path d="M10.500 21v-3.500a1.500 1.500 0 0 1 3 0V21" />
  </Trait>
);

export const IconeCouverts = (p: Props) => (
  <Trait {...p}>
    <path d="M7 3v18M4.500 3v5a2.500 2.500 0 0 0 5 0V3" />
    <path d="M17 21v-7h-2.500V8c0-3 1.200-5 2.500-5v11" />
  </Trait>
);

export const IconeCourriel = (p: Props) => (
  <Trait {...p}>
    <rect x="3" y="5.500" width="18" height="13" rx="1.500" />
    <path d="m3.500 6.500 8.500 6.500 8.500-6.500" />
  </Trait>
);

export const IconeTelephone = (p: Props) => (
  <Trait {...p}>
    <path d="M6.500 3.500h2.800l1.400 4-2 1.300a11 11 0 0 0 6.500 6.500l1.300-2 4 1.400v2.800a2 2 0 0 1-2.200 2A17 17 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200z" />
  </Trait>
);

export const IconeCoeur = (p: Props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="M12 20.500C6 16.200 3 12.800 3 9.300A4.800 4.800 0 0 1 12 7a4.800 4.800 0 0 1 9 2.300c0 3.500-3 6.900-9 11.200z" />
  </svg>
);

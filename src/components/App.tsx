import { useCallback, useState } from 'react';
import { wedding, type Direction } from '../config/wedding.ts';
import { useInvite } from '../lib/useInvite.ts';
import { Accueil } from './ecrans/Accueil.tsx';
import { LienInvalide } from './ecrans/LienInvalide.tsx';
import { useFinOuverture } from './ecrans/Ouverture.tsx';
import { PageInvitation } from './ecrans/PageInvitation.tsx';

type Phase = 'accueil' | 'ouverture' | 'invitation';

// En développement uniquement : ?ecran=invitation saute l'enveloppe et
// ?direction=B force la direction, pour les captures de contrôle.
function reglagesDev(): { phase: Phase; direction: Direction } {
  const reglages = { phase: 'accueil' as Phase, direction: wedding.direction };
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ecran') === 'invitation') reglages.phase = 'invitation';
    const direction = params.get('direction');
    if (direction === 'A' || direction === 'B') reglages.direction = direction;
  }
  return reglages;
}

export function App() {
  const invite = useInvite();
  const [{ phase: phaseInitiale, direction }] = useState(reglagesDev);
  const [phase, setPhase] = useState<Phase>(phaseInitiale);

  const afficherInvitation = useCallback(() => setPhase('invitation'), []);
  useFinOuverture(phase === 'ouverture', afficherInvitation);

  if (invite.etat === 'invalide') return <LienInvalide />;

  if (invite.etat === 'ok' && phase === 'invitation') {
    return <PageInvitation nom={invite.nom} direction={direction} />;
  }

  return (
    <Accueil
      nom={invite.etat === 'ok' ? invite.nom : null}
      ouverture={phase === 'ouverture'}
      onOuvrir={() => setPhase('ouverture')}
    />
  );
}

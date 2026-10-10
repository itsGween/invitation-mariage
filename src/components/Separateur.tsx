import { IconeCoeur } from './Icones.tsx';
import './Separateur.css';

// Deux filets dorés fins encadrant un petit cœur doré.
export function Separateur({ className = '' }: { className?: string }) {
  return (
    <div className={`separateur ${className}`} aria-hidden="true">
      <IconeCoeur />
    </div>
  );
}

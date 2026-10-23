import React from 'react';
import { Rosette, StarBullet } from './Rosette';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Actions or filters shown under the lead. */
  children?: React.ReactNode;
}

/** Night band that opens every inner page: drifting lattice, a slow rosette, gold calligraphic title. */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, lead, children }) => (
  <header className="dark relative overflow-hidden bg-night text-mist-100 bg-[radial-gradient(110%_90%_at_50%_0%,var(--color-emerald-800)_0%,var(--color-night)_65%)]">
    <div aria-hidden className="absolute -inset-20 islamic-arabesque-bg opacity-90 drift-slow" />
    <Rosette
      weight={0.6}
      className="turn-slow absolute -top-40 -start-40 w-[520px] aspect-square text-gold-500 opacity-20"
    />
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-20 sm:pb-24 text-center">
      {eyebrow && <p className="rise rise-1 text-sm font-semibold tracking-[0.08em] text-gold-300">{eyebrow}</p>}
      <h1 className="rise rise-2 mt-3 font-display font-bold text-[clamp(2.75rem,7vw,4.75rem)] leading-tight text-gold-400 [text-shadow:0_0_50px_rgba(212,175,106,0.2)]">
        {title}
      </h1>
      <div aria-hidden className="rise rise-3 mt-5 flex items-center justify-center gap-3 text-gold-500">
        <span className="h-px w-16 bg-gradient-to-l from-gold-500 to-transparent" />
        <StarBullet className="w-3 h-3" />
        <span className="h-px w-16 bg-gradient-to-r from-gold-500 to-transparent" />
      </div>
      {lead && <p className="rise rise-3 mt-6 mx-auto max-w-2xl text-lg leading-[1.9] font-light text-mist-300">{lead}</p>}
      {children && <div className="rise rise-4 mt-9">{children}</div>}
    </div>
  </header>
);

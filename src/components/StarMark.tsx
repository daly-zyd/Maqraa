import React from 'react';

interface StarMarkProps {
  className?: string;
}

/** Rub el Hizb: two overlapping squares — the traditional mark that closes a section of the mushaf. */
export const StarMark: React.FC<StarMarkProps> = ({ className = 'w-3 h-3' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="5" y="5" width="14" height="14" />
    <rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)" />
  </svg>
);

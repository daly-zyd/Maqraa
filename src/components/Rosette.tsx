import React from 'react';

/** Khatam geometry on a 220-unit box centred on 0,0: the eight-point star {8/3}, its two squares, an inner star. */
export const KHATAM_STAR = '100,0 -70.71,70.71 0,-100 70.71,70.71 -100,0 70.71,-70.71 0,100 -70.71,-70.71';
export const KHATAM_SQUARE_A = '100,0 0,100 -100,0 0,-100';
export const KHATAM_SQUARE_B = '70.71,70.71 -70.71,70.71 -70.71,-70.71 70.71,-70.71';
export const KHATAM_INNER = '54,0 -38.18,38.18 0,-54 38.18,38.18 -54,0 38.18,-38.18 0,54 -38.18,-38.18';

interface RosetteProps {
  className?: string;
  /** `full` adds the rings, squares and inner star; `star` is the bare eight-point star. */
  variant?: 'full' | 'star';
  /** Stroke width in the 220-unit box. */
  weight?: number;
}

/** Decorative gold rosette. Colour comes from `currentColor`, size and motion from `className`. */
export const Rosette: React.FC<RosetteProps> = ({ className = '', variant = 'full', weight = 0.7 }) => (
  <svg viewBox="-110 -110 220 220" className={className} aria-hidden fill="none" stroke="currentColor">
    {variant === 'full' && (
      <>
        <circle r="104" strokeOpacity={0.35} strokeWidth={weight * 0.7} />
        <circle r="97" strokeOpacity={0.5} strokeWidth={weight * 0.6} strokeDasharray="1 4" />
        <polygon points={KHATAM_SQUARE_A} strokeOpacity={0.55} strokeWidth={weight * 0.7} />
        <polygon points={KHATAM_SQUARE_B} strokeOpacity={0.55} strokeWidth={weight * 0.7} />
        <polygon points={KHATAM_INNER} strokeOpacity={0.6} strokeWidth={weight * 0.85} />
      </>
    )}
    <polygon points={KHATAM_STAR} strokeWidth={weight} />
  </svg>
);

/** Small filled star, for bullets and step markers. */
export const StarBullet: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="-110 -110 220 220" className={className} aria-hidden fill="currentColor">
    <polygon points={KHATAM_STAR} />
  </svg>
);

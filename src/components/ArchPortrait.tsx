import React from 'react';

/** Honorifics set aside when picking the letter shown in a portrait. */
const HONORIFICS = new Set(['فضيلة', 'الشيخ', 'الشيخة', 'الأستاذ', 'الأستاذة', 'المعلمة', 'الأخ', 'الأخت']);

const initialOf = (name: string): string =>
  name.split(/\s+/).find((w) => w && !HONORIFICS.has(w))?.charAt(0) ?? name.charAt(0);

interface ArchPortraitProps {
  name: string;
  size?: 'md' | 'lg';
  className?: string;
}

const SIZES = {
  md: 'w-24 h-[118px] text-4xl',
  lg: 'w-[170px] h-[210px] text-6xl'
};

/** Mihrab-arch portrait with the person's initial (until real photos exist); framed by a parchment inset and a gold rule. */
export const ArchPortrait: React.FC<ArchPortraitProps> = ({ name, size = 'lg', className = '' }) => (
  <div
    aria-hidden
    className={`grid place-items-center shrink-0 rounded-t-full rounded-b-2xl bg-emerald-900 font-display text-gold-400 shadow-[inset_0_0_0_6px_var(--color-stone-50),0_0_0_1px_var(--color-gold-600)] dark:shadow-[inset_0_0_0_6px_var(--color-emerald-950),0_0_0_1px_var(--color-gold-600)] ${SIZES[size]} ${className}`}
  >
    {initialOf(name)}
  </div>
);

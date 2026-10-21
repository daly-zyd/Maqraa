import React from 'react';
import { StarMark } from './StarMark';
import type { Verse } from '../data/verses';

interface VersePanelProps {
  verse: Verse;
  className?: string;
}

/** A verse or hadith inside a gilded frame. Text is shown whole; it is never clipped or used as a label. */
export const VersePanel: React.FC<VersePanelProps> = ({ verse, className = '' }) => (
  <figure
    className={`relative text-center px-6 py-10 sm:px-12 sm:py-14 rounded-[28px] mushaf-frame bg-paper-deep/60 dark:bg-emerald-950/60 ${className}`}
  >
    <StarMark className="w-5 h-5 mx-auto text-gold-600 dark:text-gold-400 mb-5" />
    <blockquote
      lang="ar"
      className={`mx-auto max-w-3xl text-emerald-950 dark:text-gold-100 ${
        verse.kind === 'ayah' ? 'font-quran text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl font-bold leading-[2]'
      }`}
    >
      {verse.kind === 'ayah' ? `﴿${verse.text}﴾` : `«${verse.text}»`}
    </blockquote>
    <figcaption className="mt-6 text-[15px] font-semibold text-gold-700 dark:text-gold-400">
      {verse.reference}
    </figcaption>
    {!verse.approved && (
      <p className="mt-4 inline-block rounded-full border border-oxblood-400/50 px-3 py-0.5 text-xs font-bold text-oxblood-500 dark:text-oxblood-300">
        قيد المراجعة — لا يظهر للزوار قبل اعتماد المالك
      </p>
    )}
  </figure>
);

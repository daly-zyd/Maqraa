import React from 'react';
import { StarMark } from './StarMark';

/** Gold rule with a Rub el Hizb at its centre; replaces the plain bar under page titles. */
export const OrnamentDivider: React.FC<{ className?: string }> = ({ className = 'mb-6' }) => (
  <div className={`flex items-center justify-center gap-3 text-gold-600 dark:text-gold-400 ${className}`} aria-hidden>
    <span className="h-px w-14 bg-gradient-to-l from-gold-500 to-transparent" />
    <StarMark className="w-4 h-4" />
    <span className="h-px w-14 bg-gradient-to-r from-gold-500 to-transparent" />
  </div>
);

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds before the element rises once it is in view (for staggering siblings). */
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li';
}

/**
 * Fades its content up out of a soft blur the first time it scrolls into view (CSS transition, no animation
 * library). Content is visible without JavaScript support for IntersectionObserver and under reduced motion.
 */
export const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (shown || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={`transition-[opacity,translate,filter] duration-1000 ease-out-soft motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-7 blur-[6px] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-none'
      } ${className}`}
    >
      {children}
    </Tag>
  );
};

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Rises into place on mount; keyed by path, so every route change replays it. */
const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      className={`transition-[opacity,translate] duration-350 ease-out-soft motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-none' : 'opacity-0 translate-y-2 motion-reduce:opacity-100 motion-reduce:translate-none'
      }`}
    >
      {children}
    </div>
  );
};

/** One quiet fade on route change (CSS transition). Skipped when the user prefers reduced motion. */
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return <Fade key={pathname}>{children}</Fade>;
};

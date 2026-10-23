import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/** Gold round button that appears after 400px of scroll (CSS transition; stays mounted and leaves the tab order when hidden). */
export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة إلى الأعلى"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 end-6 z-40 grid place-items-center w-12 h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-emerald-950 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] transition-[opacity,translate,scale,background-color] duration-300 ease-out-soft motion-reduce:transition-none ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
      }`}
    >
      <ChevronUp className="w-6 h-6" aria-hidden />
    </button>
  );
};

export default ScrollToTopButton;

import React, { useEffect, useState } from 'react';
import logoImg from '../assets/logo-brand.webp';

/**
 * Opening sequence: a point of light, the eight-point star draws itself, the rosette blooms around the logo,
 * the title rises, then two doors open on the site. Pure CSS (keyframes in index.css), about 3.5 s.
 *
 * Whether it plays is decided once, before React, by the inline script in index.html (sets <html data-intro>):
 * once per browser session, never under prefers-reduced-motion. Click, the skip button or Escape opens the doors.
 */
const PLAY_MS = 2600;
const OPEN_MS = 1200;

type Phase = 'play' | 'open' | 'done';

const STAR = '100,0 -70.71,70.71 0,-100 70.71,70.71 -100,0 70.71,-70.71 0,100 -70.71,-70.71';
const INNER_STAR = '54,0 -38.18,38.18 0,-54 38.18,38.18 -54,0 38.18,-38.18 0,54 -38.18,-38.18';

export const CinemaIntro: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(() =>
    document.documentElement.hasAttribute('data-intro') ? 'play' : 'done'
  );

  useEffect(() => {
    if (phase === 'done') {
      document.documentElement.removeAttribute('data-intro');
      return;
    }
    const timer = setTimeout(() => setPhase(phase === 'play' ? 'open' : 'done'), phase === 'play' ? PLAY_MS : OPEN_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'play') setPhase('open');
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  if (phase === 'done') return null;
  const skip = () => phase === 'play' && setPhase('open');

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden select-none ${phase === 'open' ? 'intro-open pointer-events-none' : 'cursor-pointer'}`}
      onClick={skip}
    >
      {/* the two doors, with the gold seam where they meet */}
      <div aria-hidden className="intro-door-right absolute inset-y-0 right-0 w-1/2 bg-night shadow-[inset_1px_0_0_rgba(212,175,106,0.35)]" />
      <div aria-hidden className="intro-door-left absolute inset-y-0 left-0 w-1/2 bg-night shadow-[inset_-1px_0_0_rgba(212,175,106,0.35)]" />
      <div aria-hidden className="intro-seam absolute inset-y-0 left-1/2 -ml-px w-0.5 bg-gold-300 opacity-0 shadow-[0_0_40px_8px_rgba(243,220,165,0.6)]" />

      <div className="intro-stage absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
        <div className="relative grid place-items-center w-[min(78vw,520px,56vh)] aspect-square">
          <div aria-hidden className="intro-spark absolute w-2.5 h-2.5 rounded-full bg-gold-50 shadow-[0_0_30px_10px_rgba(255,243,214,0.6)]" />
          <div aria-hidden className="intro-halo absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,175,106,0.32),rgba(212,175,106,0)_62%)]" />
          <svg aria-hidden viewBox="-110 -110 220 220" className="intro-bloom absolute inset-0 w-full h-full">
            <g className="intro-draw" fill="none" stroke="currentColor">
              <circle r="104" pathLength={1} className="text-gold-500" strokeOpacity={0.4} strokeWidth={0.5} />
              <polygon points={STAR} pathLength={1} className="text-gold-400" strokeWidth={0.8} />
              <polygon points="100,0 0,100 -100,0 0,-100" pathLength={1} className="text-gold-500" strokeOpacity={0.6} strokeWidth={0.5} />
              <polygon points="70.71,70.71 -70.71,70.71 -70.71,-70.71 70.71,-70.71" pathLength={1} className="text-gold-500" strokeOpacity={0.6} strokeWidth={0.5} />
              <polygon points={INNER_STAR} pathLength={1} className="text-gold-300" strokeOpacity={0.7} strokeWidth={0.6} />
            </g>
          </svg>
          <div className="intro-medal relative w-[34%] aspect-square rounded-full p-1.5 bg-emerald-900 shadow-[0_0_0_1px_rgba(212,175,106,0.7),0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <img
              src={logoImg}
              alt=""
              width={180}
              height={180}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        <p className="intro-title font-display font-bold text-6xl sm:text-8xl text-gold-400 leading-tight [text-shadow:0_0_50px_rgba(212,175,106,0.35)]">
          بالقرآن نحيا
        </p>
        <p className="intro-sub -mt-2 text-base sm:text-lg tracking-[0.1em] text-mist-300">مقرأة قرآنية مجانية للرجال والنساء</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
        className="absolute bottom-6 left-6 h-11 px-5 rounded-full border border-mist-100/25 text-sm text-mist-300 hover:text-mist-100 hover:border-gold-500 transition-colors"
      >
        تخطّي المقدمة
      </button>
    </div>
  );
};

export default CinemaIntro;

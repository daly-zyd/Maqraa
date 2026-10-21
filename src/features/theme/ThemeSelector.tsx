import React, { useEffect, useRef, useState } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { MAQRAA_THEMES } from './themes';

export const ThemeSelector: React.FC = () => {
  const { mode, maqraa, setMode, setMaqraa } = useTheme();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="المظهر"
        className="p-2.5 rounded-full text-emerald-900 dark:text-gold-200 hover:bg-emerald-900/8 dark:hover:bg-gold-400/10 transition-colors"
      >
        <Palette className="w-[18px] h-[18px]" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="اختيار المظهر"
          className="absolute end-0 mt-2 w-64 rounded-2xl border border-gold-600/30 bg-paper dark:bg-emerald-950 shadow-xl p-4 z-50"
        >
          <p className="text-sm font-bold text-emerald-900 dark:text-gold-300 mb-2">الوضع</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {([['light', 'نهاري', Sun], ['dark', 'ليلي', Moon]] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold border transition-colors ${
                  mode === id
                    ? 'bg-emerald-800 text-gold-200 border-emerald-800'
                    : 'border-gold-600/30 text-stone-700 dark:text-stone-200 hover:bg-gold-400/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm font-bold text-emerald-900 dark:text-gold-300 mb-2">لون المقرأة</p>
          <ul className="space-y-1">
            {MAQRAA_THEMES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setMaqraa(t.id)}
                  aria-pressed={maqraa === t.id}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-semibold text-stone-800 dark:text-stone-100 hover:bg-gold-400/10"
                >
                  <span
                    className="w-6 h-6 rounded-full border-2 border-gold-500 shrink-0"
                    style={{ backgroundColor: t.swatch }}
                    aria-hidden
                  />
                  <span className="flex-1 text-start">{t.label}</span>
                  {maqraa === t.id && <Check className="w-4 h-4 text-gold-600" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

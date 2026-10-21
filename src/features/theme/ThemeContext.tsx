import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_STORAGE, isMaqraaTheme } from './themes';
import type { MaqraaTheme, ThemeMode } from './themes';

interface ThemeState {
  mode: ThemeMode;
  maqraa: MaqraaTheme;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setMaqraa: (t: MaqraaTheme) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice simply is not remembered */
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = read(THEME_STORAGE.mode);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [maqraa, setMaqraa] = useState<MaqraaTheme>(() => {
    const saved = read(THEME_STORAGE.maqraa);
    return isMaqraaTheme(saved) ? saved : 'default';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    write(THEME_STORAGE.mode, mode);
  }, [mode]);

  useEffect(() => {
    if (maqraa === 'default') document.documentElement.removeAttribute('data-maqraa');
    else document.documentElement.setAttribute('data-maqraa', maqraa);
    write(THEME_STORAGE.maqraa, maqraa);
  }, [maqraa]);

  const toggleMode = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);
  const value = useMemo(
    () => ({ mode, maqraa, setMode, toggleMode, setMaqraa }),
    [mode, maqraa, toggleMode]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeState => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

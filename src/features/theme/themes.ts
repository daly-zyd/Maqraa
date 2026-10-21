export type ThemeMode = 'light' | 'dark';
export type MaqraaTheme = 'default' | 'hafs-men' | 'men' | 'women';

export interface MaqraaThemeInfo {
  id: MaqraaTheme;
  label: string;
  /** Swatch shown in the selector (the maqraa's deep colour) */
  swatch: string;
}

export const MAQRAA_THEMES: MaqraaThemeInfo[] = [
  { id: 'default', label: 'المقرأة', swatch: '#0a3226' },
  { id: 'hafs-men', label: 'حفص رجال', swatch: '#741a2d' },
  { id: 'men', label: 'رجال', swatch: '#14562f' },
  { id: 'women', label: 'نساء', swatch: '#274483' }
];

export const THEME_STORAGE = { mode: 'theme', maqraa: 'maqraa_theme' } as const;

export const isMaqraaTheme = (v: string | null): v is MaqraaTheme =>
  MAQRAA_THEMES.some((t) => t.id === v);

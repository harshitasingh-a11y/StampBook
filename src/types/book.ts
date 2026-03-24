export interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  colorTheme: string;
  pageCount: number;
  createdAt: string;
  sharedFromOwnerUid?: string; // UID of the original owner if this is a shared book
  isShared?: boolean; // True if this book has been shared with others
}

export const THEME_COLORS: Record<string, string> = {
  terracotta: 'var(--theme-terracotta)',
  sage: 'var(--theme-sage)',
  navy: 'var(--theme-navy)',
  'dusty-rose': 'var(--theme-dusty-rose)',
  ochre: 'var(--theme-ochre)',
  slate: 'var(--theme-slate)',
  plum: 'var(--theme-plum)',
  teal: 'var(--theme-teal)',
  sienna: 'var(--theme-sienna)',
  forest: 'var(--theme-forest)',
};

// Raw hex values for inline styles
export const THEME_HEX: Record<string, string> = {
  terracotta: '#c4683c',
  sage: '#7a9e7e',
  navy: '#2c3e6b',
  'dusty-rose': '#c08b8b',
  ochre: '#c9a227',
  slate: '#5e6b7a',
  plum: '#7b4f6a',
  teal: '#3d7f8e',
  sienna: '#a0522d',
  forest: '#4a6741',
};

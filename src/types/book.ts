export interface CoverSticker {
  id: string;
  src: string;
  x: number;      // % of board width (0–100)
  y: number;      // % of board height (0–100)
  width: number;  // % of board width
  rotation: number;
}

export interface ShareRecipient {
  displayName: string;
  canEdit: boolean;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  colorTheme: string;
  pageCount: number;
  createdAt: string;
  sharedFromOwnerUid?: string; // UID of the original owner if this is a shared book
  isShared?: boolean; // True if this book has been shared with others
  ownerDisplayName?: string; // Display name of the owner, stored when sharing
  ownerEmail?: string; // Email of the owner, used for extracting display name if needed
  sharedWith?: ShareRecipient[]; // People this book has been shared with
  stickers?: CoverSticker[];
  clipStyle?: string;
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

export const CLIP_OPTIONS: { key: string; src: string; label: string }[] = [
  { key: 'default', src: '/static/clip.svg', label: 'Classic' },
  { key: '1', src: '/clips/1.png', label: 'Style 1' },
  { key: '2', src: '/clips/2.png', label: 'Style 2' },
  { key: '3', src: '/clips/3.png', label: 'Style 3' },
  { key: 'frame5', src: '/clips/Frame 5.png', label: 'Style 4' },
];

export const AVAILABLE_STICKERS: string[] = [
  '/stickers/1.png',
  '/stickers/2.png',
  '/stickers/3.png',
  '/stickers/4.png',
  '/stickers/5.png',
  '/stickers/6.png',
  '/stickers/7.png',
  '/stickers/8.png',
  '/stickers/9.png',
  '/stickers/10.png',
  '/stickers/12.png',
  '/stickers/13.png',
  '/stickers/14.png',
  '/stickers/15.png',
  '/stickers/16.png',
  '/stickers/17.png',
  '/stickers/_ (2) 1.png',
  '/stickers/twice · the best thing i ever did 1.png',
];

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

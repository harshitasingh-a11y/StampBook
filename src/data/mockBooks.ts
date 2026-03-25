import type { Book } from '@/types/book';

export const mockBooks: Book[] = [
  {
    id: 'mock-bentota-2026',
    title: 'Vacations 2026',
    coverImage: null,
    colorTheme: 'teal',
    pageCount: 8,
    createdAt: '2026-01-15T10:30:00.000Z',
    clipStyle: '3',
    stickers: [
      { id: 's1', src: '/stickers/15.png', x: 53, y: 5,  width: 22, rotation: -5 },
      { id: 's2', src: '/stickers/16.png', x: 12, y: 42, width: 26, rotation: 4  },
    ],
  },
  {
    id: 'mock-family-sundays',
    title: 'Family Sundays',
    coverImage: null,
    colorTheme: 'dusty-rose',
    pageCount: 12,
    createdAt: '2025-11-20T14:00:00.000Z',
    clipStyle: '1',
    stickers: [
      { id: 's1', src: '/stickers/_ (2) 1.png', x: 50, y: 5,  width: 32, rotation: 6  },
      { id: 's2', src: '/stickers/4.png',        x: 10, y: 48, width: 24, rotation: -9 },
    ],
  },
  {
    id: 'mock-tokyo-winter',
    title: 'Tokyo Winter',
    coverImage: null,
    colorTheme: 'navy',
    pageCount: 5,
    createdAt: '2026-02-01T09:00:00.000Z',
    clipStyle: '2',
    stickers: [
      { id: 's1', src: '/stickers/2.png',  x: 48, y: 5,  width: 34, rotation: -6 },
      { id: 's2', src: '/stickers/8.png',  x: 10, y: 45, width: 26, rotation: 10 },
    ],
  },
  {
    id: 'mock-weekend-hikes',
    title: 'Weekend Hikes',
    coverImage: null,
    colorTheme: 'forest',
    pageCount: 3,
    createdAt: '2026-03-05T16:45:00.000Z',
    clipStyle: 'frame5',
    stickers: [
      { id: 's1', src: '/stickers/7.png',  x: 52, y: 6,  width: 28, rotation: 7  },
      { id: 's2', src: '/stickers/17.png', x: 12, y: 47, width: 24, rotation: -8 },
    ],
  },
];

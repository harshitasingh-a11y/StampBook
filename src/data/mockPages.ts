import type { Page } from '@/types/page';

export const mockPages: Page[] = [
  /* ── Page 1 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-0',
    bookId: 'mock-bentota-2026',
    position: 0,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-0-0',
        pageId: 'mock-page-0',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota1/400/400',
        mediaType: 'photo',
        frameDesignId: 'classic',
        filterId: null,
        captionText: 'Sunrise on the beach',
        rotation: -1.5,
        createdAt: '2026-01-15T08:00:00.000Z',
      },
    ],
    postmarkDate: '2026-01-15',
    postmarkLocation: 'Bentota Beach, Sri Lanka',
    journalText:
      'Arrived just as the sun was cresting the horizon. The beach was completely empty — just us, the warm sand, and the sound of waves breaking gently on the shore.\n\nThe drive from Colombo took about two hours but every moment was worth it. Coconut palms everywhere, and the air smells faintly of salt and jasmine.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },

  /* ── Page 2 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-1',
    bookId: 'mock-bentota-2026',
    position: 1,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-1-0',
        pageId: 'mock-page-1',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota5/400/400',
        mediaType: 'photo',
        frameDesignId: 'polaroid',
        filterId: null,
        captionText: 'River safari',
        rotation: -2.0,
        createdAt: '2026-01-16T11:00:00.000Z',
      },
    ],
    postmarkDate: '2026-01-16',
    postmarkLocation: 'Bentota Beach, Sri Lanka',
    journalText:
      'Took a boat up the Bentota River this morning. Spotted a water monitor lizard sunning itself on a log — must have been nearly two metres long.\n\nThe mangroves are astonishing. Light filters through the canopy in soft columns. Could have stayed all day.',
    createdAt: '2026-01-16T11:00:00.000Z',
  },

  /* ── Page 3 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-2',
    bookId: 'mock-bentota-2026',
    position: 2,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-2-0',
        pageId: 'mock-page-2',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota7/400/400',
        mediaType: 'photo',
        frameDesignId: 'postage',
        filterId: null,
        captionText: 'Temple visit',
        rotation: 0.8,
        createdAt: '2026-01-17T09:00:00.000Z',
      },
    ],
    postmarkDate: '2026-01-17',
    postmarkLocation: 'Galle, Sri Lanka',
    journalText:
      'Day trip to Galle Fort — a UNESCO site that still feels lived-in rather than preserved under glass. Street cricket in the alley behind the Dutch Reformed Church.\n\nBought a bag of cinnamon from a tiny spice shop. The owner brewed us tea without asking. These are the moments you can\'t plan.',
    createdAt: '2026-01-17T09:00:00.000Z',
  },

  /* ── Page 4 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-3',
    bookId: 'mock-bentota-2026',
    position: 3,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-3-0',
        pageId: 'mock-page-3',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota9/400/400',
        mediaType: 'photo',
        frameDesignId: 'rounded',
        filterId: null,
        captionText: 'Turtle hatchery',
        rotation: 1.2,
        createdAt: '2026-01-18T10:00:00.000Z',
      },
    ],
    postmarkDate: '2026-01-18',
    postmarkLocation: 'Kosgoda, Sri Lanka',
    journalText:
      'Visited the turtle hatchery at Kosgoda in the afternoon. Tiny olive ridley hatchlings tumbling over each other in shallow trays.\n\nReleased three into the ocean at dusk. Watching them find the sea for the first time is something I will never forget.',
    createdAt: '2026-01-18T10:00:00.000Z',
  },

  /* ── Page 5 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-4',
    bookId: 'mock-bentota-2026',
    position: 4,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-4-0',
        pageId: 'mock-page-4',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota11/400/400',
        mediaType: 'photo',
        frameDesignId: 'torn-edge',
        filterId: null,
        captionText: 'Golden hour',
        rotation: -0.8,
        createdAt: '2026-01-19T17:30:00.000Z',
      },
    ],
    postmarkDate: '2026-01-19',
    postmarkLocation: 'Bentota Beach, Sri Lanka',
    journalText:
      'Last full day. Spent the whole afternoon on the beach — reading, swimming, doing nothing in particular.\n\nThe sunsets here are different. The sky goes through a dozen shades of orange before it decides on purple. I never want to leave.',
    createdAt: '2026-01-19T17:30:00.000Z',
  },

  /* ── Page 6 ───────────────────────────────────────────────── */
  {
    id: 'mock-page-5',
    bookId: 'mock-bentota-2026',
    position: 5,
    stampCount: 1,
    stamps: [
      {
        id: 'stamp-5-0',
        pageId: 'mock-page-5',
        slotPosition: 0,
        mediaUrl: 'https://picsum.photos/seed/bentota13/400/400',
        mediaType: 'photo',
        frameDesignId: 'classic',
        filterId: null,
        captionText: 'Farewell breakfast',
        rotation: 2.1,
        createdAt: '2026-01-20T08:00:00.000Z',
      },
    ],
    postmarkDate: '2026-01-20',
    postmarkLocation: 'Bentota Beach, Sri Lanka',
    journalText:
      'Checked out at nine. The cook made hoppers one last time — crispy edges, soft centre, a fried egg in the bowl. Ate three.\n\nOn the road back to Colombo, a rainbow over the paddy fields. A good omen, or just a good memory either way.',
    createdAt: '2026-01-20T08:00:00.000Z',
  },
];

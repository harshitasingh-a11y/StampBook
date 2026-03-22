import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, Stamp, FrameDesignId } from '@/types/page';
import { useBooksStore } from './booksStore';

interface PagesState {
  pages: Page[];
  getPagesByBookId: (bookId: string) => Page[];
  addPage: (bookId: string) => Page;
  updateStampCount: (pageId: string, count: number) => void;
  setStamp: (pageId: string, slotPosition: number, data: Partial<Stamp>) => void;
  removeStamp: (pageId: string, slotPosition: number) => void;
  seedPages: (pages: Page[]) => void;
}

export const usePagesStore = create<PagesState>()(
  persist(
    (set, get) => ({
      pages: [],

      getPagesByBookId: (bookId) =>
        get()
          .pages.filter((p) => p.bookId === bookId)
          .sort((a, b) => a.position - b.position),

      addPage: (bookId) => {
        const existing = get().pages.filter((p) => p.bookId === bookId);
        const newPage: Page = {
          id: crypto.randomUUID(),
          bookId,
          position: existing.length,
          stampCount: 1,
          stamps: [],
          postmarkDate: new Date().toISOString().slice(0, 10),
          postmarkLocation: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ pages: [...state.pages, newPage] }));

        // Update book's pageCount
        const booksState = useBooksStore.getState();
        const book = booksState.getBookById(bookId);
        if (book) {
          useBooksStore.setState((s) => ({
            books: s.books.map((b) =>
              b.id === bookId ? { ...b, pageCount: existing.length + 1 } : b
            ),
          }));
        }

        return newPage;
      },

      updateStampCount: (pageId, count) => {
        const clamped = Math.max(1, Math.min(4, count));
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId ? { ...p, stampCount: clamped } : p
          ),
        }));
      },

      setStamp: (pageId, slotPosition, data) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            const existingIdx = p.stamps.findIndex(
              (s) => s.slotPosition === slotPosition
            );
            const stamp: Stamp = {
              id: data.id ?? crypto.randomUUID(),
              pageId,
              slotPosition,
              mediaUrl: data.mediaUrl ?? null,
              mediaType: data.mediaType ?? null,
              frameDesignId: (data.frameDesignId ?? 'classic') as FrameDesignId,
              filterId: data.filterId ?? null,
              captionText: data.captionText ?? null,
              rotation: data.rotation ?? 0,
              createdAt: data.createdAt ?? new Date().toISOString(),
            };
            const stamps =
              existingIdx >= 0
                ? p.stamps.map((s, i) => (i === existingIdx ? stamp : s))
                : [...p.stamps, stamp];
            return { ...p, stamps };
          }),
        }));
      },

      removeStamp: (pageId, slotPosition) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId
              ? { ...p, stamps: p.stamps.filter((s) => s.slotPosition !== slotPosition) }
              : p
          ),
        }));
      },

      seedPages: (pages) => {
        set((state) => {
          const existingBookIds = new Set(state.pages.map((p) => p.bookId));
          const newPages = pages.filter((p) => !existingBookIds.has(p.bookId));
          if (newPages.length === 0) return state;
          return { pages: [...state.pages, ...newPages] };
        });
      },
    }),
    {
      name: 'stampbook-pages',
    }
  )
);

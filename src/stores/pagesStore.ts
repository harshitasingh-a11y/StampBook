import { create } from 'zustand';
import type { Page, Stamp, FrameDesignId } from '@/types/page';
import { useBooksStore } from './booksStore';
import { savePage as fbSavePage, saveBook as fbSaveBook, deletePage as fbDeletePage } from '@/lib/firestoreService';

interface PagesState {
  uid: string | null;
  pages: Page[];
  setUid: (uid: string | null) => void;
  getPagesByBookId: (bookId: string) => Page[];
  addPage: (bookId: string) => Page;
  deletePage: (pageId: string) => void;
  updateStampCount: (pageId: string, count: number) => void;
  updateJournalText: (pageId: string, text: string) => void;
  updateStampTitle: (pageId: string, title: string) => void;
  updateStampSubheading: (pageId: string, subheading: string) => void;
  setStamp: (pageId: string, slotPosition: number, data: Partial<Stamp>) => void;
  removeStamp: (pageId: string, slotPosition: number) => void;
  seedPages: (pages: Page[]) => void;
}

export const usePagesStore = create<PagesState>()((set, get) => ({
  uid: null,
  pages: [],

  setUid: (uid) => set({ uid }),

  getPagesByBookId: (bookId) =>
    get()
      .pages.filter((p) => p.bookId === bookId)
      .sort((a, b) => a.position - b.position),

  addPage: (bookId) => {
    const uid = get().uid;
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
      const updatedBook = { ...book, pageCount: existing.length + 1 };
      useBooksStore.setState((s) => ({
        books: s.books.map((b) => (b.id === bookId ? updatedBook : b)),
      }));
      if (uid) fbSaveBook(uid, updatedBook);
    }

    if (uid) fbSavePage(uid, newPage);
    return newPage;
  },

  deletePage: (pageId) => {
    const uid = get().uid;
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;
    const { bookId } = page;

    set((state) => ({ pages: state.pages.filter((p) => p.id !== pageId) }));

    // Update book's pageCount
    const booksState = useBooksStore.getState();
    const book = booksState.getBookById(bookId);
    if (book) {
      const updatedBook = { ...book, pageCount: Math.max(0, book.pageCount - 1) };
      useBooksStore.setState((s) => ({
        books: s.books.map((b) => (b.id === bookId ? updatedBook : b)),
      }));
      if (uid) fbSaveBook(uid, updatedBook);
    }

    if (uid) fbDeletePage(uid, pageId);
  },

  updateJournalText: (pageId, text) => {
    const uid = get().uid;
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, journalText: text } : p
      ),
    }));
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  updateStampTitle: (pageId, title) => {
    const uid = get().uid;
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, stampTitle: title } : p
      ),
    }));
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  updateStampSubheading: (pageId, subheading) => {
    const uid = get().uid;
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, stampSubheading: subheading } : p
      ),
    }));
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  updateStampCount: (pageId, count) => {
    const uid = get().uid;
    const clamped = Math.max(1, Math.min(4, count));
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, stampCount: clamped } : p
      ),
    }));
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  setStamp: (pageId, slotPosition, data) => {
    const uid = get().uid;
    set((state) => ({
      pages: state.pages.map((p) => {
        if (p.id !== pageId) return p;
        const existingIdx = p.stamps.findIndex(
          (s) => s.slotPosition === slotPosition
        );
        const existing = existingIdx >= 0 ? p.stamps[existingIdx] : null;
        const stamp: Stamp = {
          id: existing?.id ?? crypto.randomUUID(),
          pageId,
          slotPosition,
          mediaUrl: data.mediaUrl ?? null,
          mediaType: data.mediaType ?? null,
          // Always an array — undefined breaks Firestore writes
          videoClips: data.mediaType === 'video' ? (data.videoClips ?? []) : [],
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
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  removeStamp: (pageId, slotPosition) => {
    const uid = get().uid;
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, stamps: p.stamps.filter((s) => s.slotPosition !== slotPosition) }
          : p
      ),
    }));
    if (uid) {
      const page = get().pages.find((p) => p.id === pageId);
      if (page) fbSavePage(uid, page);
    }
  },

  seedPages: (pages) => {
    const seedBookIds = new Set(pages.map((p) => p.bookId));
    set((state) => ({
      pages: [
        ...state.pages.filter((p) => !seedBookIds.has(p.bookId)),
        ...pages,
      ],
    }));
  },
}));

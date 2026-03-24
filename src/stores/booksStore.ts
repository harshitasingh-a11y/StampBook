import { create } from 'zustand';
import type { Book, CoverSticker } from '@/types/book';
import { saveBook as fbSaveBook, deleteBook as fbDeleteBook, getUserBooks } from '@/lib/firestoreService';

interface BooksState {
  uid: string | null;
  books: Book[];
  setUid: (uid: string | null) => void;
  addBook: (title: string, colorTheme: string, stickers?: CoverSticker[], clipStyle?: string) => void;
  updateBook: (id: string, changes: Partial<Pick<Book, 'title' | 'colorTheme' | 'stickers' | 'clipStyle'>>) => void;
  addSharedBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
}

export const useBooksStore = create<BooksState>()((set, get) => ({
  uid: null,
  books: [],

  setUid: (uid) => set({ uid }),

  addBook: (title, colorTheme, stickers, clipStyle) => {
    const uid = get().uid;
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      coverImage: null,
      colorTheme,
      pageCount: 0,
      createdAt: new Date().toISOString(),
      ...(stickers && stickers.length > 0 ? { stickers } : {}),
      ...(clipStyle && clipStyle !== 'default' ? { clipStyle } : {}),
    };
    set((state) => ({ books: [...state.books, newBook] }));
    if (uid) fbSaveBook(uid, newBook);
  },

  updateBook: (id, changes) => {
    const uid = get().uid;
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    }));
    const updated = get().books.find((b) => b.id === id);
    if (uid && updated) fbSaveBook(uid, updated);
  },

  addSharedBook: async (book) => {
    const uid = get().uid;
    if (!uid) return;

    // Check if book already exists in collection
    const exists = get().books.some((b) => b.id === book.id);
    if (!exists) {
      // Save to Firestore first
      try {
        await fbSaveBook(uid, book);
        // Then fetch fresh books list from Firestore to ensure sync
        const updatedBooks = await getUserBooks(uid);
        set({ books: updatedBooks });
      } catch (error) {
        console.error('Error adding shared book:', error);
        // Fallback: update local store anyway
        set((state) => ({ books: [...state.books, book] }));
      }
    }
  },

  removeBook: (id) => {
    const uid = get().uid;
    set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
    if (uid) fbDeleteBook(uid, id);
  },

  getBookById: (id) => get().books.find((b) => b.id === id),
}));

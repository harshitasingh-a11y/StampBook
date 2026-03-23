import { create } from 'zustand';
import type { Book } from '@/types/book';
import { saveBook as fbSaveBook, deleteBook as fbDeleteBook, getUserBooks } from '@/lib/firestoreService';

interface BooksState {
  uid: string | null;
  books: Book[];
  setUid: (uid: string | null) => void;
  addBook: (title: string, colorTheme: string) => void;
  addSharedBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
}

export const useBooksStore = create<BooksState>()((set, get) => ({
  uid: null,
  books: [],

  setUid: (uid) => set({ uid }),

  addBook: (title, colorTheme) => {
    const uid = get().uid;
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      coverImage: null,
      colorTheme,
      pageCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ books: [...state.books, newBook] }));
    if (uid) fbSaveBook(uid, newBook);
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

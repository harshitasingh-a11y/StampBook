import { create } from 'zustand';
import type { Book } from '@/types/book';
import { saveBook as fbSaveBook, deleteBook as fbDeleteBook } from '@/lib/firestoreService';

interface BooksState {
  uid: string | null;
  books: Book[];
  setUid: (uid: string | null) => void;
  addBook: (title: string, colorTheme: string) => void;
  addSharedBook: (book: Book) => void;
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

  addSharedBook: (book) => {
    const uid = get().uid;
    // Check if book already exists in collection
    const exists = get().books.some((b) => b.id === book.id);
    if (!exists) {
      set((state) => ({ books: [...state.books, book] }));
      if (uid) fbSaveBook(uid, book);
    }
  },

  removeBook: (id) => {
    const uid = get().uid;
    set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
    if (uid) fbDeleteBook(uid, id);
  },

  getBookById: (id) => get().books.find((b) => b.id === id),
}));

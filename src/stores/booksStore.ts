import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book } from '@/types/book';

interface BooksState {
  books: Book[];
  addBook: (title: string, colorTheme: string) => void;
  removeBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
}

export const useBooksStore = create<BooksState>()(
  persist(
    (set, get) => ({
      books: [],
      addBook: (title, colorTheme) => {
        const newBook: Book = {
          id: crypto.randomUUID(),
          title,
          coverImage: null,
          colorTheme,
          pageCount: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ books: [...state.books, newBook] }));
      },
      removeBook: (id) => {
        set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
      },
      getBookById: (id) => {
        return get().books.find((b) => b.id === id);
      },
    }),
    {
      name: 'stampbook-books',
    }
  )
);

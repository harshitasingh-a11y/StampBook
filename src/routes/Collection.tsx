import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import BookCard from '@/components/BookCard/BookCard';
import NewBookCard from '@/components/NewBookCard/NewBookCard';
import { useBooksStore } from '@/stores/booksStore';
import { mockBooks } from '@/data/mockBooks';
import styles from './Collection.module.css';

export default function Collection() {
  const books = useBooksStore((s) => s.books);

  // Seed mock data on first load if store is empty
  useEffect(() => {
    const state = useBooksStore.getState();
    if (state.books.length === 0) {
      mockBooks.forEach((book) => {
        useBooksStore.setState((s) => ({ books: [...s.books, book] }));
      });
    }
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Collection</h1>
        <span className={styles.count}>
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </span>
      </header>

      <LayoutGroup>
        <div className={styles.grid}>
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
          <NewBookCard />
        </div>
      </LayoutGroup>
    </div>
  );
}

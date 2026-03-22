import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import { usePagesStore } from '@/stores/pagesStore';
import { mockBooks } from '@/data/mockBooks';
import { mockPages } from '@/data/mockPages';
import { THEME_HEX } from '@/types/book';
import PageFlipContainer from '@/components/PageFlipContainer/PageFlipContainer';
import styles from './BookView.module.css';

export default function BookView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const books = useBooksStore((s) => s.books);
  const book = books.find((b) => b.id === bookId);
  const allPages = usePagesStore((s) => s.pages);
  const pages = allPages
    .filter((p) => p.bookId === bookId)
    .sort((a, b) => a.position - b.position);
  const seedPages = usePagesStore((s) => s.seedPages);
  const addPage = usePagesStore((s) => s.addPage);

  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);

  // Seed mock books if store is empty (e.g. direct navigation to /book/:id)
  useEffect(() => {
    const state = useBooksStore.getState();
    if (state.books.length === 0) {
      mockBooks.forEach((b) => {
        useBooksStore.setState((s) => ({ books: [...s.books, b] }));
      });
    }
    setReady(true);
  }, []);

  // Seed mock pages on first load
  useEffect(() => {
    if (bookId === 'mock-bentota-2026') {
      seedPages(mockPages);
    }
  }, [bookId, seedPages]);

  const handleAddPage = useCallback(() => {
    if (!bookId) return;
    addPage(bookId);
    setCurrentPage(pages.length);
  }, [bookId, addPage, pages.length]);

  if (!ready) return null;

  if (!book) {
    return (
      <div className={styles.notFound}>
        <p>Book not found</p>
        <button onClick={() => navigate('/')}>Back to Collection</button>
      </div>
    );
  }

  const accentColor = THEME_HEX[book.colorTheme] ?? '#5e6b7a';

  return (
    <motion.div
      className={styles.view}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/')}
          aria-label="Back to collection"
        >
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>{book.title}</h1>
          {pages.length > 0 && (
            <span className={styles.indicator}>
              Page {currentPage + 1} / {pages.length}
            </span>
          )}
        </div>
        <div className={styles.headerRight} />
      </header>

      {/* Page area */}
      {pages.length > 0 ? (
        <PageFlipContainer
          pages={pages}
          accentColor={accentColor}
          currentIndex={currentPage}
          onIndexChange={setCurrentPage}
        />
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No pages yet</p>
        </div>
      )}

      {/* Add page button */}
      <div className={styles.footer}>
        <button
          className={styles.addPageBtn}
          onClick={handleAddPage}
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <Plus size={16} />
          <span>New Page</span>
        </button>
      </div>
    </motion.div>
  );
}

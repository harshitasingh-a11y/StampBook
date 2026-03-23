import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import { usePagesStore } from '@/stores/pagesStore';
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
  const addPage = usePagesStore((s) => s.addPage);

  const [currentPage, setCurrentPage] = useState(0);


  const hasEmptyPage = pages.some(
    (p) => !p.journalText?.trim() && p.stamps.length === 0
  );

  const handleAddPage = useCallback(() => {
    if (!bookId || hasEmptyPage) return;
    addPage(bookId);
    setCurrentPage(pages.length);
  }, [bookId, addPage, pages.length, hasEmptyPage]);

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

      {/* Footer */}
      <div className={styles.footer}>
            <button
              className={styles.editNavBtn}
              disabled={currentPage <= 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.editPageLabel}>
              Page {currentPage + 1} / {pages.length}
            </span>
            <button
              className={styles.editNavBtn}
              disabled={currentPage >= pages.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
        <div className={styles.addPageWrap}>
          <button
            className={styles.addPageBtn}
            onClick={handleAddPage}
            disabled={hasEmptyPage}
            style={{ borderColor: accentColor, color: accentColor, opacity: hasEmptyPage ? 0.35 : 1 }}
          >
            <Plus size={16} />
            <span>New Page</span>
          </button>
          {hasEmptyPage && (
            <span className={styles.addPageTooltip}>
              You cannot make a new page with an existing empty page in book
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

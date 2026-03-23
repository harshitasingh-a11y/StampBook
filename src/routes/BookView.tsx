import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Share2 } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import { usePagesStore } from '@/stores/pagesStore';
import { THEME_HEX } from '@/types/book';
import { getSharedBook, getSharedPages, savePage, deletePage as fbDeletePage } from '@/lib/firestoreService';
import type { Book } from '@/types/book';
import type { Page } from '@/types/page';
import PageFlipContainer from '@/components/PageFlipContainer/PageFlipContainer';
import ShareBookModal from '@/components/ShareBookModal/ShareBookModal';
import styles from './BookView.module.css';

export default function BookView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ownerUid = searchParams.get('owner');
  const editAccess = searchParams.get('edit') === 'true';

  const books = useBooksStore((s) => s.books);
  const currentUserUid = useBooksStore((s) => s.uid);
  const allPages = usePagesStore((s) => s.pages);
  const addPage = usePagesStore((s) => s.addPage);

  const [currentPage, setCurrentPage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedBook, setSharedBook] = useState<Book | null>(null);
  const [sharedPages, setSharedPages] = useState<Page[]>([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  // Determine if viewing shared book
  const isSharedView = !!ownerUid && ownerUid !== currentUserUid;

  // Load shared book data
  useEffect(() => {
    if (isSharedView && bookId && ownerUid) {
      setIsLoadingShared(true);
      Promise.all([
        getSharedBook(ownerUid, bookId),
        getSharedPages(ownerUid, bookId),
      ])
        .then(([book, pages]) => {
          if (book) {
            setSharedBook(book);
            setSharedPages(pages.sort((a, b) => a.position - b.position));
          }
        })
        .finally(() => setIsLoadingShared(false));
    }
  }, [isSharedView, bookId, ownerUid]);

  const book = isSharedView ? sharedBook : books.find((b) => b.id === bookId);
  const pages = isSharedView
    ? sharedPages
    : allPages.filter((p) => p.bookId === bookId).sort((a, b) => a.position - b.position);


  const hasEmptyPage = pages.some(
    (p) => !p.journalText?.trim() && p.stamps.length === 0
  );

  const handleAddPage = useCallback(() => {
    if (!bookId || hasEmptyPage) return;

    if (isSharedView && editAccess && ownerUid) {
      // Create page for shared book
      const newPage: Page = {
        id: crypto.randomUUID(),
        bookId,
        position: pages.length,
        stampCount: 0,
        journalText: '',
        postmarkDate: new Date().toISOString().split('T')[0],
        postmarkLocation: null,
        stampTitle: '',
        stampSubheading: '',
        stamps: [],
        createdAt: new Date().toISOString(),
      };
      setSharedPages([...sharedPages, newPage]);
      savePage(ownerUid, newPage);
    } else {
      addPage(bookId);
    }

    setCurrentPage(pages.length);
  }, [bookId, hasEmptyPage, isSharedView, editAccess, ownerUid, pages.length, sharedPages, addPage]);

  // Create wrapper functions for shared book editing
  const handleUpdateJournalText = useCallback((pageId: string, text: string) => {
    const updateFn = usePagesStore.getState().updateJournalText;
    if (isSharedView && editAccess && ownerUid) {
      // Update local state first for instant UI feedback
      updateFn(pageId, text);
      // Save to owner's Firestore collection
      const page = sharedPages.find((p) => p.id === pageId);
      if (page) {
        savePage(ownerUid, { ...page, journalText: text });
      }
    } else {
      updateFn(pageId, text);
    }
  }, [isSharedView, editAccess, ownerUid, sharedPages]);

  const handleDeletePage = useCallback((pageId: string) => {
    const deleteFn = usePagesStore.getState().deletePage;
    if (isSharedView && editAccess && ownerUid) {
      deleteFn(pageId);
      fbDeletePage(ownerUid, pageId);
    } else {
      deleteFn(pageId);
    }
  }, [isSharedView, editAccess, ownerUid]);

  if (isLoadingShared) {
    return (
      <div className={styles.notFound}>
        <p>Loading shared book...</p>
      </div>
    );
  }

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
          <h1 className={styles.title}>
            {book.title}
            {isSharedView && <span className={styles.sharedBadge}>Shared</span>}
          </h1>
        </div>
        {!isSharedView && (
          <button
            className={styles.shareBtn}
            onClick={() => setShowShareModal(true)}
            aria-label="Share this book"
            title="Share this book"
          >
            <Share2 size={20} />
          </button>
        )}
      </header>

      {/* Page area */}
      {pages.length > 0 ? (
        <PageFlipContainer
          pages={pages}
          accentColor={accentColor}
          currentIndex={currentPage}
          onIndexChange={setCurrentPage}
          readOnly={isSharedView && !editAccess}
          onUpdateText={isSharedView && editAccess && ownerUid ? handleUpdateJournalText : undefined}
          onDeletePage={isSharedView && editAccess && ownerUid ? handleDeletePage : undefined}
        />
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No pages yet</p>
        </div>
      )}

      {/* Footer */}
      {(!isSharedView || editAccess) && (
        <div className={styles.footer}>
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
      )}

      {/* Share Modal */}
      {!isSharedView && (
        <ShareBookModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          bookId={book.id}
          bookTitle={book.title}
          ownerUid={currentUserUid || ''}
        />
      )}
    </motion.div>
  );
}

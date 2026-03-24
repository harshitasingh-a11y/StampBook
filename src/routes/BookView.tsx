import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Share2 } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import { usePagesStore } from '@/stores/pagesStore';
import { THEME_HEX } from '@/types/book';
import { getSharedBook, getSharedPages, savePage, deletePage as fbDeletePage, getDisplayNameFromEmail, getUserEmail } from '@/lib/firestoreService';
import type { Book } from '@/types/book';
import type { Page } from '@/types/page';
import PageFlipContainer from '@/components/PageFlipContainer/PageFlipContainer';
import ShareBookModal from '@/components/ShareBookModal/ShareBookModal';
import ParticipantsAvatar from '@/components/ParticipantsAvatar/ParticipantsAvatar';
import styles from './BookView.module.css';

export default function BookView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlOwnerUid = searchParams.get('owner');
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
  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null);

  // Get current book from store
  const ownBook = books.find((b) => b.id === bookId);

  // If this is a shared book opened from collection (no owner URL param),
  // redirect to the shared view with owner param
  useEffect(() => {
    if (!urlOwnerUid && ownBook?.sharedFromOwnerUid && currentUserUid) {
      const owner = ownBook.sharedFromOwnerUid;
      navigate(`/book/${bookId}?owner=${owner}`, { replace: true });
    }
  }, [bookId, urlOwnerUid, ownBook?.sharedFromOwnerUid, currentUserUid, navigate]);

  // Determine the actual owner UID (from URL param)
  const ownerUid = urlOwnerUid;

  // Determine if viewing shared book
  const isSharedView = !!ownerUid && ownerUid !== currentUserUid;

  // Load shared book data and owner info
  useEffect(() => {
    if (!isSharedView || !bookId || !ownerUid) return;
    let cancelled = false;
    setIsLoadingShared(true);

    Promise.all([
      getSharedBook(ownerUid, bookId),
      getSharedPages(ownerUid, bookId),
      getUserEmail(ownerUid),
    ])
      .then(([book, pages, ownerEmail]) => {
        if (cancelled) return;
        if (book) {
          setSharedBook(book);
          setSharedPages(pages.sort((a, b) => a.position - b.position));

          // Set owner display name from book or extract from fetched email
          let displayName = book.ownerDisplayName;
          if (!displayName && ownerEmail) {
            displayName = getDisplayNameFromEmail(ownerEmail);
          }
          if (displayName) {
            setOwnerDisplayName(displayName);
          }
        }
      })
      .finally(() => { if (!cancelled) setIsLoadingShared(false); });
    return () => { cancelled = true; };
  }, [isSharedView, bookId, ownerUid]);

  const book = isSharedView ? sharedBook : books.find((b) => b.id === bookId);
  const pages = isSharedView
    ? sharedPages
    : allPages.filter((p) => p.bookId === bookId).sort((a, b) => a.position - b.position);


  // Auto-create a default page for books that have none
  useEffect(() => {
    if (!bookId || isSharedView || pages.length > 0) return;
    // Only auto-create once the store is ready (book exists)
    if (!ownBook) return;
    addPage(bookId);
  }, [bookId, isSharedView, pages.length, ownBook, addPage]);

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
    if (isSharedView && editAccess && ownerUid) {
      // Update sharedPages local state for instant UI feedback
      setSharedPages((prev) => prev.map((p) => p.id === pageId ? { ...p, journalText: text } : p));
      // Save to owner's Firestore collection
      const page = sharedPages.find((p) => p.id === pageId);
      if (page) {
        savePage(ownerUid, { ...page, journalText: text });
      }
    } else {
      usePagesStore.getState().updateJournalText(pageId, text);
    }
  }, [isSharedView, editAccess, ownerUid, sharedPages]);

  const handleDeletePage = useCallback((pageId: string) => {
    if (isSharedView && editAccess && ownerUid) {
      // Update sharedPages local state
      setSharedPages((prev) => prev.filter((p) => p.id !== pageId));
      fbDeletePage(ownerUid, pageId);
    } else {
      usePagesStore.getState().deletePage(pageId);
    }
  }, [isSharedView, editAccess, ownerUid]);

  const handleBackClick = useCallback(async () => {
    // Save shared book to current user's collection before navigating away
    // Use urlOwnerUid to track the original sharer (don't use ownBook's sharedFromOwnerUid here)
    if (urlOwnerUid && book && currentUserUid && urlOwnerUid !== currentUserUid) {
      try {
        const sharedBookData: Book = {
          ...book,
          sharedFromOwnerUid: urlOwnerUid,
        };
        await useBooksStore.getState().addSharedBook(sharedBookData);
      } catch (error) {
        console.error('Error saving shared book to collection:', error);
      }
    }
    navigate('/');
  }, [urlOwnerUid, book, currentUserUid, navigate]);

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
          onClick={handleBackClick}
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
        <div className={styles.headerRight}>
          {(isSharedView || book.isShared) && (
            <ParticipantsAvatar
              ownerName={ownerDisplayName || book.ownerDisplayName}
              recipients={book.sharedWith}
              yourAccessLevel={isSharedView ? (editAccess ? 'can edit' : 'view only') : undefined}
              isSharedView={isSharedView}
              accentColor={accentColor}
            />
          )}
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
        </div>
      </header>

      {/* Page area */}
      {pages.length > 0 ? (
        <>
          <PageFlipContainer
            pages={pages}
            accentColor={accentColor}
            currentIndex={currentPage}
            onIndexChange={setCurrentPage}
            readOnly={isSharedView && !editAccess}
            onUpdateText={isSharedView && editAccess && ownerUid ? handleUpdateJournalText : undefined}
            onDeletePage={isSharedView && editAccess && ownerUid ? handleDeletePage : undefined}
          />
          {/* Keyboard Tip */}
          <div className={styles.keyboardTip}>
            Use arrow keys <span className={styles.arrow}>←</span> <span className={styles.arrow}>→</span> to turn pages
          </div>
        </>
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

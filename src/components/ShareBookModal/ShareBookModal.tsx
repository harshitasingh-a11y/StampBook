import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import { saveBook } from '@/lib/firestoreService';
import styles from './ShareBookModal.module.css';

interface ShareBookModalProps {
  isOpen: boolean;
  bookId: string;
  bookTitle: string;
  ownerUid: string;
  onClose: () => void;
}

export default function ShareBookModal({ isOpen, bookId, bookTitle, ownerUid, onClose }: ShareBookModalProps) {
  const [copied, setCopied] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  const getBookById = useBooksStore((s) => s.getBookById);

  const shareUrl = `${window.location.origin}/?share=${bookId}&owner=${ownerUid}${allowEdit ? '&edit=true' : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      // Mark book as shared
      const book = getBookById(bookId);
      if (book && !book.isShared) {
        const updatedBook = { ...book, isShared: true };
        await saveBook(ownerUid, updatedBook);
        // Update local store
        const books = useBooksStore.getState().books;
        useBooksStore.setState({
          books: books.map((b) => (b.id === bookId ? updatedBook : b)),
        });
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Read "${bookTitle}" - Journal`,
          text: `Check out this beautiful memory journal: ${bookTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.close} onClick={onClose}>
              <X size={20} strokeWidth={1.5} />
            </button>

            <h2 className={styles.heading}>Share "{bookTitle}"</h2>
            <p className={styles.description}>Share this book with your friends</p>

            <div className={styles.permissionSection}>
              <div className={styles.permissionLabel}>
                <span>Allow editing</span>
                <p className={styles.permissionDescription}>Recipients can edit and add pages</p>
              </div>
              <button
                className={`${styles.toggleBtn} ${allowEdit ? styles.toggleBtnOn : ''}`}
                onClick={() => setAllowEdit(!allowEdit)}
                role="switch"
                aria-checked={allowEdit}
                aria-label="Allow edit access"
              >
                <div className={styles.toggleCircle} />
              </button>
            </div>

            <div className={styles.linkSection}>
              <div className={styles.linkBox}>
                <input
                  type="text"
                  className={styles.linkInput}
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  className={styles.copyBtn}
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copied && <span className={styles.copiedMessage}>Link copied!</span>}
            </div>

            <button
              className={styles.shareBtn}
              onClick={handleShare}
            >
              {navigator.share && typeof navigator.share === 'function' ? 'Share via...' : 'Copy Link'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

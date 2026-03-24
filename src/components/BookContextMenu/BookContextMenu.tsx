import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Trash2, Pencil } from 'lucide-react';
import { useBooksStore } from '@/stores/booksStore';
import ShareBookModal from '@/components/ShareBookModal/ShareBookModal';
import styles from './BookContextMenu.module.css';

interface BookContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  ownerUid: string;
  position?: { x: number; y: number };
  onEditCover?: () => void;
}

export default function BookContextMenu({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  ownerUid,
  position = { x: 0, y: 0 },
  onEditCover,
}: BookContextMenuProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const removeBook = useBooksStore((s) => s.removeBook);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${bookTitle}"? This cannot be undone.`)) {
      removeBook(bookId);
      onClose();
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            className={styles.menu}
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            {onEditCover && (
              <button className={styles.option} onClick={() => { onEditCover(); onClose(); }}>
                <Pencil size={16} />
                <span>Edit Cover</span>
              </button>
            )}

            <button className={styles.option} onClick={handleShare}>
              <Share2 size={16} />
              <span>Share</span>
            </button>

            <button className={`${styles.option} ${styles.delete}`} onClick={handleDelete}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Render menu in portal to avoid stacking context issues */}
      {createPortal(menuContent, document.body)}

      {/* Share Modal */}
      <ShareBookModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          onClose();
        }}
        bookId={bookId}
        bookTitle={bookTitle}
        ownerUid={ownerUid}
      />
    </>
  );
}

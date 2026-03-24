import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '@/types/book';
import { THEME_HEX } from '@/types/book';
import BookContextMenu from '@/components/BookContextMenu/BookContextMenu';
import { useBooksStore } from '@/stores/booksStore';
import styles from './BookCard.module.css';

const CLIP_IMG = '/static/clip.svg';
const TEXTURE_IMG = '/static/texture.jpg';
const BOARD_SHAPE_IMG = '/static/board-shape.svg';
const STAMP_IMG = '/static/stamp.png';
const MEMORIES_IMG = '/static/memories.png';

interface BookCardProps {
  book: Book;
  index: number;
}

function hashToRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return ((hash % 30) / 10) - 1.5;
}

export default function BookCard({ book, index }: BookCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const rotation = hashToRotation(book.id);
  const bgColor = THEME_HEX[book.colorTheme] ?? '#5e6b7a';
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const uid = useBooksStore((s) => s.uid) || '';

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If Ctrl/Cmd is pressed, show the menu
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();

      // Position menu at the bottom of the card, centered horizontally
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMenuPos({
          x: rect.left + rect.width / 2 - 80,
          y: rect.bottom + 10,
        });
      }
      setMenuOpen(true);
    } else {
      // Normal click - navigate to the book
      navigate(`/book/${book.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{ '--rotation': `${rotation}deg` } as React.CSSProperties}
      className={styles.wrapper}
    >
      <div
        ref={cardRef}
        className={styles.card}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        {/* Metal clip at top */}
        <div className={styles.clipArea}>
          <img src={CLIP_IMG} alt="" className={styles.clipImg} />
        </div>

        {/* Clipboard board */}
        <div
          className={styles.board}
          style={{ '--book-color': bgColor } as React.CSSProperties}
        >
          {/* Cardboard texture overlay */}
          <img src={TEXTURE_IMG} alt="" className={styles.texture} />

          {/* Board shadow/depth shape */}
          <img src={BOARD_SHAPE_IMG} alt="" className={styles.boardShape} />

          {/* Memories sticker – top-right of board */}
          <div className={styles.memoriesSticker}>
            <img src={MEMORIES_IMG} alt="Memories" />
          </div>

          {/* Postage stamp – rotated */}
          <div className={styles.stamp}>
            <div className={styles.stampInner}>
              <img src={STAMP_IMG} alt="" />
            </div>
          </div>

          {/* Title label box – bottom left */}
          <div className={styles.titleLabel}>
            <div className={styles.titleWithBadge}>
              <span className={styles.labelTitle}>{book.title}</span>
              {(book.sharedFromOwnerUid || book.isShared) && (
                <span className={styles.sharedBadge}>Shared</span>
              )}
            </div>
            <span className={styles.labelPages}>
              {book.pageCount} {book.pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <BookContextMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        bookId={book.id}
        bookTitle={book.title}
        ownerUid={uid}
        position={menuPos}
      />
    </motion.div>
  );
}

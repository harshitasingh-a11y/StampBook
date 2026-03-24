import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker/ColorPicker';
import { useBooksStore } from '@/stores/booksStore';
import { THEME_HEX } from '@/types/book';
import type { Book, CoverSticker } from '@/types/book';
import BookCoverPreview from './BookCoverPreview';
import ClipChooser from './ClipChooser';
import StickerLibrary from './StickerLibrary';
import styles from './NewBookModal.module.css';

const DEFAULT_STICKERS: CoverSticker[] = [
  { id: 'default-memories', src: '/static/memories.png', x: 55.4, y: 8.4, width: 25.07, rotation: 0 },
  { id: 'default-stamp', src: '/static/stamp.png', x: 65.5, y: 24.15, width: 22.7, rotation: 9.03 },
];

interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the modal opens in edit mode for this book */
  editBook?: Book;
}

export default function NewBookModal({ isOpen, onClose, editBook }: NewBookModalProps) {
  const isEditMode = !!editBook;

  const [title, setTitle] = useState('');
  const [colorTheme, setColorTheme] = useState('terracotta');
  const [clipStyle, setClipStyle] = useState('default');
  const [stickers, setStickers] = useState<CoverSticker[]>(DEFAULT_STICKERS);
  const inputRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const addBook = useBooksStore((s) => s.addBook);
  const updateBook = useBooksStore((s) => s.updateBook);

  // Populate state when opening
  useEffect(() => {
    if (isOpen) {
      if (editBook) {
        setTitle(editBook.title);
        setColorTheme(editBook.colorTheme);
        setClipStyle(editBook.clipStyle ?? 'default');
        setStickers(editBook.stickers ?? DEFAULT_STICKERS);
      } else {
        setTitle('');
        setColorTheme('terracotta');
        setClipStyle('default');
        setStickers(DEFAULT_STICKERS);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, editBook]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (isEditMode && editBook) {
      updateBook(editBook.id, { title: title.trim(), colorTheme, stickers, clipStyle });
    } else {
      addBook(title.trim(), colorTheme, stickers, clipStyle);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) handleSubmit();
  };

  const handleStickerDrop = (src: string, x: number, y: number) => {
    setStickers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), src, x, y, width: 22, rotation: Math.random() * 20 - 10 },
    ]);
  };

  const handleStickerMove = (id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const handleStickerRemove = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleStickerResize = (id: string, width: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, width } : s)));
  };

  const accentColor = colorTheme.startsWith('#') ? colorTheme : THEME_HEX[colorTheme];

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
            <div className={styles.header}>
              <h2 className={styles.heading}>{isEditMode ? 'Edit Cover' : 'New Book'}</h2>
              <button className={styles.close} onClick={onClose}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className={styles.body}>
              {/* Left: inputs */}
              <div className={styles.leftPanel}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.titleInput}
                  placeholder="Name your book..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={60}
                />

                <div className={styles.section}>
                  <span className={styles.sectionLabel}>Choose a color</span>
                  <ColorPicker selected={colorTheme} onChange={setColorTheme} />
                </div>

                <div className={styles.section}>
                  <span className={styles.sectionLabel}>Choose a clip</span>
                  <ClipChooser selected={clipStyle} onChange={setClipStyle} />
                </div>

                <div className={styles.section}>
                  <span className={styles.sectionLabel}>Add stickers — drag onto cover</span>
                  <StickerLibrary boardRef={boardRef} onStickerDrop={handleStickerDrop} />
                </div>

                <button
                  className={styles.createBtn}
                  disabled={!title.trim()}
                  onClick={handleSubmit}
                  style={{ backgroundColor: title.trim() ? accentColor : undefined }}
                >
                  {isEditMode ? 'Save Changes' : 'Create'}
                </button>
              </div>

              {/* Right: live preview */}
              <div className={styles.rightPanel}>
                <BookCoverPreview
                  title={title}
                  colorTheme={colorTheme}
                  clipStyle={clipStyle}
                  stickers={stickers}
                  onStickerMove={handleStickerMove}
                  onStickerRemove={handleStickerRemove}
                  onStickerResize={handleStickerResize}
                  boardRef={boardRef}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker/ColorPicker';
import { useBooksStore } from '@/stores/booksStore';
import { THEME_HEX } from '@/types/book';
import styles from './NewBookModal.module.css';

interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewBookModal({ isOpen, onClose }: NewBookModalProps) {
  const [title, setTitle] = useState('');
  const [colorTheme, setColorTheme] = useState('terracotta');
  const inputRef = useRef<HTMLInputElement>(null);
  const addBook = useBooksStore((s) => s.addBook);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!title.trim()) return;
    addBook(title.trim(), colorTheme);
    setTitle('');
    setColorTheme('terracotta');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleCreate();
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

            <h2 className={styles.heading}>New Book</h2>

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

            <button
              className={styles.createBtn}
              disabled={!title.trim()}
              onClick={handleCreate}
              style={{
                backgroundColor: title.trim()
                  ? THEME_HEX[colorTheme]
                  : undefined,
              }}
            >
              Create
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

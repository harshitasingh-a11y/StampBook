import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '@/types/book';
import { THEME_HEX } from '@/types/book';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  index: number;
}

function hashToRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return ((hash % 30) / 10) - 1.5; // range: -1.5 to 1.5
}

export default function BookCard({ book, index }: BookCardProps) {
  const rotation = hashToRotation(book.id);
  const bgColor = THEME_HEX[book.colorTheme] ?? '#5e6b7a';

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
      <Link to={`/book/${book.id}`} className={styles.card}>
        <div
          className={styles.cover}
          style={{
            backgroundColor: bgColor,
            backgroundImage: book.coverImage
              ? `url(${book.coverImage})`
              : undefined,
          }}
        />
        <div className={styles.info}>
          <h3 className={styles.title}>{book.title}</h3>
          <span className={styles.pageCount}>
            {book.pageCount} {book.pageCount === 1 ? 'page' : 'pages'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

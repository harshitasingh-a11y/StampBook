import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LayoutGroup } from 'framer-motion';
import { Plus } from 'lucide-react';
import BookCard from '@/components/BookCard/BookCard';
import NewBookCard from '@/components/NewBookCard/NewBookCard';
import NewBookModal from '@/components/NewBookModal/NewBookModal';
import { useBooksStore } from '@/stores/booksStore';
import styles from './Collection.module.css';

export default function Collection() {
  const books = useBooksStore((s) => s.books);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle shared book links
  useEffect(() => {
    const sharedBookId = searchParams.get('share');
    const ownerUid = searchParams.get('owner');
    const editAccess = searchParams.get('edit');

    if (sharedBookId && ownerUid) {
      // Navigate to the shared book view
      const url = `/book/${sharedBookId}?owner=${ownerUid}${editAccess ? '&edit=true' : ''}`;
      navigate(url, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Collection</h1>
          <span className={styles.count}>
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>
        <button className={styles.createBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} strokeWidth={2} />
          New Book
        </button>
      </header>

      <NewBookModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <LayoutGroup>
        <div className={styles.grid}>
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
          <NewBookCard />
        </div>
      </LayoutGroup>
    </div>
  );
}

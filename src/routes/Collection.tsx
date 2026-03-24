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
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');
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

  const myBooks = books.filter((b) => !b.isShared && !b.sharedFromOwnerUid);
  const sharedBooks = books.filter((b) => b.isShared || b.sharedFromOwnerUid);

  const displayedBooks =
    activeTab === 'mine' ? myBooks :
    activeTab === 'shared' ? sharedBooks :
    books;

  const displayCount = displayedBooks.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Collection</h1>
          <span className={styles.count}>
            {displayCount} {displayCount === 1 ? 'book' : 'books'}
          </span>
        </div>
        <button className={styles.createBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} strokeWidth={2} />
          New Book
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mine' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          My Books
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'shared' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          Shared
        </button>
      </div>

      <NewBookModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <LayoutGroup>
        <div className={styles.grid}>
          {displayedBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
          {activeTab === 'mine' && <NewBookCard />}
        </div>
      </LayoutGroup>
    </div>
  );
}

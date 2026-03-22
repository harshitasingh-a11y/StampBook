import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, PlusCircle, Inbox, Globe } from 'lucide-react';
import NewBookModal from '@/components/NewBookModal/NewBookModal';
import styles from './TabBar.module.css';

export default function TabBar() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className={styles.tabBar}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <BookOpen className={styles.icon} size={22} strokeWidth={1.8} />
          <span className={styles.label}>Collection</span>
        </NavLink>

        <button
          className={`${styles.tab} ${modalOpen ? styles.active : ''}`}
          onClick={() => setModalOpen(true)}
        >
          <PlusCircle className={styles.icon} size={22} strokeWidth={1.8} />
          <span className={styles.label}>Create</span>
        </button>

        <NavLink
          to="/community"
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <Globe className={styles.icon} size={22} strokeWidth={1.8} />
          <span className={styles.label}>Community</span>
        </NavLink>

        <NavLink
          to="/inbox"
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <Inbox className={styles.icon} size={22} strokeWidth={1.8} />
          <span className={styles.label}>Inbox</span>
        </NavLink>
      </nav>

      <NewBookModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

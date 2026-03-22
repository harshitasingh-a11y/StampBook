import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, PlusCircle, Globe, Inbox } from 'lucide-react';
import NewBookModal from '@/components/NewBookModal/NewBookModal';
import styles from './SideNav.module.css';

const NAV_LINKS = [
  { to: '/',          end: true,  icon: BookOpen, label: 'Collection' },
  { to: '/community', end: false, icon: Globe,    label: 'Community'  },
  { to: '/inbox',     end: false, icon: Inbox,    label: 'Inbox'      },
];

export default function SideNav() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className={styles.nav}>
        {/* Logo — from Figma file SfcbEWpss8uhCNulsxEhDN node 8-89 */}
        <div className={styles.logo}>
          <div className={styles.logoIconWrap}>
            <img src="/static/logo-stamp.png" alt="" className={styles.logoImg} />
          </div>
          <span className={styles.logoText}>StampBook</span>
        </div>

        {/* Nav items */}
        <ul className={styles.items}>
          {NAV_LINKS.map(({ to, end, icon: Icon, label }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.active : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.7} className={styles.icon} />
                <span className={styles.label}>{label}</span>
              </NavLink>
            </li>
          ))}

          {/* Create — opens modal, same as TabBar */}
          <li>
            <button
              className={`${styles.item} ${modalOpen ? styles.active : ''}`}
              onClick={() => setModalOpen(true)}
            >
              <PlusCircle size={18} strokeWidth={1.7} className={styles.icon} />
              <span className={styles.label}>Create</span>
            </button>
          </li>
        </ul>
      </nav>

      <NewBookModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

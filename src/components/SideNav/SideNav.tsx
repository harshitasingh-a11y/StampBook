import { NavLink } from 'react-router-dom';
import { BookOpen, Globe, Inbox, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './SideNav.module.css';

const NAV_LINKS = [
  { to: '/',          end: true,  icon: BookOpen, label: 'Collection' },
  { to: '/community', end: false, icon: Globe,    label: 'Community'  },
  { to: '/inbox',     end: false, icon: Inbox,    label: 'Inbox'      },
];

export default function SideNav() {
  const { user, logout } = useAuth();

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const firstName = displayName.split(' ')[0];
  const initial = displayName[0]?.toUpperCase() ?? '?';

  return (
    <nav className={styles.nav}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src="/static/newlogo.png" alt="" className={styles.logoImg} />
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
      </ul>

      {/* Profile */}
      <div className={styles.profile}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt={displayName} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatar}>{initial}</div>
        )}
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{firstName}</span>
          <span className={styles.profileSub}>{user?.email}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <LogOut size={14} strokeWidth={1.7} />
        </button>
      </div>
    </nav>
  );
}

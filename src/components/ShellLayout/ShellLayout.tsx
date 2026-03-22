import { Outlet } from 'react-router-dom';
import TabBar from '@/components/TabBar/TabBar';
import SideNav from '@/components/SideNav/SideNav';
import styles from './ShellLayout.module.css';

export default function ShellLayout() {
  return (
    <div className={styles.layout}>
      {/* Sidebar — visible on desktop only */}
      <SideNav />

      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Bottom tab bar — visible on mobile only */}
      <TabBar />
    </div>
  );
}

import { useState } from 'react';
import CommunityCard from '@/components/CommunityCard/CommunityCard';
import { mockCommunityItems } from '@/data/mockCommunity';
import type { CommunityItemType } from '@/types/community';
import styles from './Community.module.css';

const FILTERS: { label: string; value: 'all' | CommunityItemType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pages', value: 'page' },
  { label: 'Stamps', value: 'stamp' },
];

export default function Community() {
  const [filter, setFilter] = useState<'all' | CommunityItemType>('all');

  const items = filter === 'all'
    ? mockCommunityItems
    : mockCommunityItems.filter((i) => i.type === filter);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community</h1>
          <p className={styles.subtitle}>Browse and save templates from other makers</p>
          <span className={styles.wip}>Work in progress</span>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`${styles.filterBtn} ${filter === f.value ? styles.active : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.grid}>
        {items.map((item, i) => (
          <CommunityCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

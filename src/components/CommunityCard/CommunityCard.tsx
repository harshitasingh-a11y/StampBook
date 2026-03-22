import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Layers, Stamp } from 'lucide-react';
import type { CommunityItem } from '@/types/community';
import { THEME_HEX } from '@/types/book';
import styles from './CommunityCard.module.css';

interface CommunityCardProps {
  item: CommunityItem;
  index: number;
}

export default function CommunityCard({ item, index }: CommunityCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const bgColor = THEME_HEX[item.colorTheme] ?? '#5e6b7a';

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      {/* Preview area */}
      <div className={styles.preview} style={{ backgroundColor: bgColor }}>
        <div className={styles.previewInner}>
          {item.type === 'page' && item.stampCount ? (
            <div className={styles.stampGrid} data-count={item.stampCount}>
              {Array.from({ length: Math.min(item.stampCount, 4) }).map((_, i) => (
                <div key={i} className={styles.stampSlot} />
              ))}
            </div>
          ) : (
            <div className={styles.singleStamp} />
          )}
        </div>
        <span className={styles.typeBadge}>
          {item.type === 'page'
            ? <><Layers size={11} strokeWidth={2} /> Page</>
            : <><Stamp size={11} strokeWidth={2} /> Stamp</>
          }
        </span>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.title}>{item.title}</h3>

        <div className={styles.tags}>
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.author}>
            <span className={styles.avatar}>{item.author.avatar}</span>
            <span className={styles.authorName}>{item.author.name}</span>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
              onClick={() => setLiked((v) => !v)}
            >
              <Heart size={13} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
              <span>{item.likes + (liked ? 1 : 0)}</span>
            </button>
            <button
              className={`${styles.actionBtn} ${saved ? styles.saved : ''}`}
              onClick={() => setSaved((v) => !v)}
            >
              <Bookmark size={13} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <button
          className={styles.useBtn}
          style={{ borderColor: bgColor, color: bgColor }}
        >
          Use as template
        </button>
      </div>
    </motion.div>
  );
}

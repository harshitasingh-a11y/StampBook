import { motion } from 'framer-motion';
import type { Stamp } from '@/types/page';
import styles from './StampSlot.module.css';

interface StampSlotProps {
  stamp: Stamp;
}

export default function StampSlot({ stamp }: StampSlotProps) {
  return (
    <motion.div
      className={`${styles.slot} ${styles[stamp.frameDesignId] ?? ''}`}
      style={{ '--rotation': `${stamp.rotation}deg` } as React.CSSProperties}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={styles.frame}>
        {stamp.mediaUrl ? (
          <img
            src={stamp.mediaUrl}
            alt={stamp.captionText ?? ''}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
      {stamp.captionText && (
        <span className={styles.caption}>{stamp.captionText}</span>
      )}
    </motion.div>
  );
}

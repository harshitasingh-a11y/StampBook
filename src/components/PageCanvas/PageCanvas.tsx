import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { Page, Stamp } from '@/types/page';
import { usePagesStore } from '@/stores/pagesStore';
import styles from './PageCanvas.module.css';

interface PageCanvasProps {
  page: Page;
  accentColor: string;
}

// ─── Postage Stamp ────────────────────────────────────────────────────────────
// Matches the Paper MCP design: perforated edge, sage-green image area, text, dots
interface StampProps {
  stamp: Stamp | null;
  location: string;
  year: string;
}

function PostageStamp({ stamp, location, year }: StampProps) {
  const title = location.toUpperCase().replace(', SRI LANKA', '').trim();

  return (
    <div className={styles.stamp}>
      <div className={styles.stampImageArea}>
        {stamp?.mediaUrl ? (
          <img src={stamp.mediaUrl} className={styles.stampPhoto} alt={title} />
        ) : null}
      </div>
      <div className={styles.stampInfo}>
        <div className={styles.stampTexts}>
          <span className={styles.stampTitle}>{title}</span>
          <span className={styles.stampYear}>{year}</span>
        </div>
        <div className={styles.stampDots}>
          <div className={styles.dot1} />
          <div className={styles.dot2} />
        </div>
      </div>
    </div>
  );
}

// ─── Page Canvas ──────────────────────────────────────────────────────────────

export default function PageCanvas({ page, accentColor }: PageCanvasProps) {
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const updateStampCount = usePagesStore((s) => s.updateStampCount);

  const firstStamp = page.stamps[0] ?? null;
  const location = page.postmarkLocation ?? 'Location';
  const year = page.postmarkDate.slice(0, 4);

  return (
    <div className={styles.spread} onClick={() => setToolbarOpen((p) => !p)}>

      {/* Left page — blank */}
      <div className={styles.leftPage} />

      {/* Spine shadow */}
      <div className={styles.spine} />

      {/* Right page — stamp */}
      <div className={styles.rightPage}>
        <div className={styles.stampWrap}>
          <PostageStamp stamp={firstStamp} location={location} year={year} />
        </div>

        {/* Postmark */}
        <div className={styles.postmark} style={{ color: accentColor }}>
          <div className={styles.postmarkCircle}>
            <span className={styles.postmarkDate}>{page.postmarkDate}</span>
            {page.postmarkLocation && (
              <span className={styles.postmarkLocation}>{page.postmarkLocation}</span>
            )}
          </div>
        </div>
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {toolbarOpen && (
          <motion.div
            className={styles.toolbar}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.toolbarBtn}
              onClick={() => updateStampCount(page.id, page.stampCount - 1)}
              disabled={page.stampCount <= 1}
            >
              <Minus size={18} />
            </button>
            <span className={styles.toolbarLabel}>
              {page.stampCount} {page.stampCount === 1 ? 'slot' : 'slots'}
            </span>
            <button
              className={styles.toolbarBtn}
              onClick={() => updateStampCount(page.id, page.stampCount + 1)}
              disabled={page.stampCount >= 4}
            >
              <Plus size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

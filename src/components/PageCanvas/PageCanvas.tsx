import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus, Share2, Pencil, Trash2 } from 'lucide-react';
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
  stampTitle: string;
  stampSubheading: string;
  onTitleChange: (val: string) => void;
  onSubheadingChange: (val: string) => void;
}

function PostageStamp({ stamp, stampTitle, stampSubheading, onTitleChange, onSubheadingChange }: StampProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  // Set initial content via ref so React doesn't fight with contentEditable DOM
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== stampTitle) {
      titleRef.current.textContent = stampTitle;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (subRef.current && subRef.current.textContent !== stampSubheading) {
      subRef.current.textContent = stampSubheading;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.stamp}>
      <div className={styles.stampImageArea}>
        {stamp?.mediaUrl ? (
          <img src={stamp.mediaUrl} className={styles.stampPhoto} alt={stampTitle} />
        ) : null}
      </div>
      <div className={styles.stampInfo}>
        <div className={styles.stampTexts}>
          <span
            ref={titleRef}
            className={styles.stampTitle}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Add Stamp Title"
            onBlur={(e) => onTitleChange(e.currentTarget.textContent ?? '')}
            onClick={(e) => e.stopPropagation()}
          />
          <span
            ref={subRef}
            className={styles.stampYear}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Add subheading"
            onBlur={(e) => onSubheadingChange(e.currentTarget.textContent ?? '')}
            onClick={(e) => e.stopPropagation()}
          />
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
  const updateStampTitle = usePagesStore((s) => s.updateStampTitle);
  const updateStampSubheading = usePagesStore((s) => s.updateStampSubheading);

  const firstStamp = page.stamps[0] ?? null;
  const stampTitle = page.stampTitle ?? '';
  const stampSubheading = page.stampSubheading ?? '';

  return (
    <div className={styles.spread} onClick={() => setToolbarOpen((p) => !p)}>

      {/* Page action icons — top right */}
      <div className={styles.pageActions} onClick={(e) => e.stopPropagation()}>
        {[
          { icon: <Share2 size={15} />, label: 'Share this page' },
          { icon: <Pencil size={15} />, label: 'Edit this page' },
          { icon: <Trash2 size={15} />, label: 'Delete this page', danger: true },
        ].map(({ icon, label, danger }) => (
          <div key={label} className={styles.actionWrap}>
            <button
              className={`${styles.actionBtn} ${danger ? styles.actionBtnDanger : ''}`}
              aria-label={label}
            >
              {icon}
            </button>
            <span className={styles.tooltip}>{label}</span>
          </div>
        ))}
      </div>

      {/* Left page — journal text */}
      <div className={styles.leftPage}>
        {page.journalText ? (
          <div className={styles.journalText}>
            {page.journalText.split('\n\n').map((para, i) => (
              <p key={i} className={styles.journalPara}>{para}</p>
            ))}
          </div>
        ) : null}
      </div>

      {/* Spine shadow */}
      <div className={styles.spine} />

      {/* Right page — stamp */}
      <div className={styles.rightPage}>
        <div className={styles.stampWrap}>
          <PostageStamp
            stamp={firstStamp}
            stampTitle={stampTitle}
            stampSubheading={stampSubheading}
            onTitleChange={(val) => updateStampTitle(page.id, val)}
            onSubheadingChange={(val) => updateStampSubheading(page.id, val)}
          />
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

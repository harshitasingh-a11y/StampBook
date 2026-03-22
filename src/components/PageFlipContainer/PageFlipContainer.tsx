import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Page } from '@/types/page';
import PageCanvas from '@/components/PageCanvas/PageCanvas';
import { playPageFlip } from '@/utils/playPageFlip';
import styles from './PageFlipContainer.module.css';

// Open book visual — saved locally in public/static/
const ASSET_BOOK = '/static/book.png';
const ASSET_CLIP = '/static/clip.svg';
const ASSET_TEX_LEFT = '/static/tex-left.png';
const ASSET_TEX_RIGHT_BACK = '/static/tex-right-back.png';
const ASSET_TEX_RIGHT = '/static/tex-right.png';

interface PageFlipContainerProps {
  pages: Page[];
  accentColor: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 250;

export default function PageFlipContainer({
  pages,
  accentColor,
  currentIndex,
  onIndexChange,
}: PageFlipContainerProps) {
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (next < 0 || next >= pages.length) return;
      setDirection(dir);
      onIndexChange(next);
      playPageFlip();
    },
    [pages.length, onIndexChange]
  );

  const goForward = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);
  const goBackward = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) goForward();
      else if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) goBackward();
    },
    [goForward, goBackward]
  );

  const page = pages[currentIndex];
  if (!page) return null;

  const variants = {
    enter: (d: number) => ({ x: d >= 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d >= 0 ? '-30%' : '30%', opacity: 0 }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.bookFrame}>

        {/* Layer 1: page surface textures */}
        <img className={`${styles.tex} ${styles.texLeft}`} src={ASSET_TEX_LEFT} alt="" aria-hidden="true" />
        <img className={`${styles.tex} ${styles.texRightBack}`} src={ASSET_TEX_RIGHT_BACK} alt="" aria-hidden="true" />
        <img className={`${styles.tex} ${styles.texRight}`} src={ASSET_TEX_RIGHT} alt="" aria-hidden="true" />

        {/* Layer 2: page content */}
        <div className={styles.pageArea}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page.id}
              className={styles.page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
            >
              <PageCanvas page={page} accentColor={accentColor} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Layer 3: kraft border frames the content */}
        <img className={styles.bookImg} src={ASSET_BOOK} alt="open book" aria-hidden="true" />

        {/* Layer 4: binder clip */}
        <img className={styles.clip} src={ASSET_CLIP} alt="" aria-hidden="true" />
      </div>

      {currentIndex > 0 && (
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={goBackward} aria-label="Previous page">
          <ChevronLeft size={20} />
        </button>
      )}
      {currentIndex < pages.length - 1 && (
        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={goForward} aria-label="Next page">
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

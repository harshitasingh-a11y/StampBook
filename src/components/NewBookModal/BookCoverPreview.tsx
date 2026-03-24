import { Maximize2 } from 'lucide-react';
import type { CoverSticker } from '@/types/book';
import { THEME_HEX, CLIP_OPTIONS } from '@/types/book';
import styles from './BookCoverPreview.module.css';

const TEXTURE_IMG = '/static/texture.jpg';
const BOARD_SHAPE_IMG = '/static/board-shape.svg';

interface BookCoverPreviewProps {
  title: string;
  colorTheme: string;
  clipStyle: string;
  stickers: CoverSticker[];
  onStickerMove: (id: string, x: number, y: number) => void;
  onStickerRemove: (id: string) => void;
  onStickerResize: (id: string, width: number) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

export default function BookCoverPreview({
  title,
  colorTheme,
  clipStyle,
  stickers,
  onStickerMove,
  onStickerRemove,
  onStickerResize,
  boardRef,
}: BookCoverPreviewProps) {
  const bgColor = colorTheme.startsWith('#')
    ? colorTheme
    : (THEME_HEX[colorTheme] ?? '#5e6b7a');
  const clip = CLIP_OPTIONS.find((c) => c.key === clipStyle) ?? CLIP_OPTIONS[0];

  return (
    <div className={styles.preview}>
      <div className={styles.card}>
        {/* Clip */}
        <div className={styles.clipArea}>
          <img src={clip.src} alt="" className={styles.clipImg} />
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className={styles.board}
          style={{ '--book-color': bgColor } as React.CSSProperties}
        >
          <img src={TEXTURE_IMG} alt="" className={styles.texture} />
          <img src={BOARD_SHAPE_IMG} alt="" className={styles.boardShape} />

          {/* Stickers (includes defaults + user-placed) */}
          {stickers.map((sticker) => (
            <StickerOnBoard
              key={sticker.id}
              sticker={sticker}
              boardRef={boardRef}
              onMove={onStickerMove}
              onRemove={onStickerRemove}
              onResize={onStickerResize}
            />
          ))}

          {/* Title label */}
          <div className={styles.titleLabel}>
            <span className={styles.labelTitle}>{title || 'Your book'}</span>
            <span className={styles.labelPages}>0 pages</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StickerOnBoardProps {
  sticker: CoverSticker;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number) => void;
}

function StickerOnBoard({ sticker, boardRef, onMove, onRemove, onResize }: StickerOnBoardProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag when clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();

    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();

    // Offset from the sticker's top-left to where the user clicked
    const stickerPxX = (sticker.x / 100) * boardRect.width;
    const stickerPxY = (sticker.y / 100) * boardRect.height;
    const offsetX = e.clientX - boardRect.left - stickerPxX;
    const offsetY = e.clientY - boardRect.top - stickerPxY;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = ((e.clientX - boardRect.left - offsetX) / boardRect.width) * 100;
      const newY = ((e.clientY - boardRect.top - offsetY) / boardRect.height) * 100;
      onMove(sticker.id, Math.max(0, Math.min(95, newX)), Math.max(0, Math.min(95, newY)));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const startX = e.clientX;
    const startWidth = (sticker.width / 100) * boardRect.width;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      const newWidthPx = Math.max(16, startWidth + delta);
      const newWidthPct = Math.min(80, (newWidthPx / boardRect.width) * 100);
      onResize(sticker.id, newWidthPct);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={styles.stickerOnBoard}
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        width: `${sticker.width}%`,
        transform: `rotate(${sticker.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={sticker.src} alt="" className={styles.stickerImg} draggable={false} />
      <button
        className={styles.removeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(sticker.id);
        }}
        aria-label="Remove sticker"
      >
        ×
      </button>
      <button
        className={styles.resizeHandle}
        onMouseDown={handleResizeMouseDown}
        aria-label="Resize sticker"
      >
        <Maximize2 size={8} strokeWidth={2.5} />
      </button>
    </div>
  );
}

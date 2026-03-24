import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AVAILABLE_STICKERS } from '@/types/book';
import styles from './StickerLibrary.module.css';

interface StickerLibraryProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  onStickerDrop: (src: string, x: number, y: number) => void;
}

interface DragState {
  src: string;
  x: number;
  y: number;
}

export default function StickerLibrary({ boardRef, onStickerDrop }: StickerLibraryProps) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const draggingRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const next = { ...draggingRef.current!, x: e.clientX, y: e.clientY };
      draggingRef.current = next;
      setDragging(next);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const board = boardRef.current;
      if (board && draggingRef.current) {
        const rect = board.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (inside) {
          // Offset by half the default sticker width (22%) so it lands centered on cursor
          const halfW = 11;
          const halfH = 11;
          const x = Math.max(0, ((e.clientX - rect.left) / rect.width) * 100 - halfW);
          const y = Math.max(0, ((e.clientY - rect.top) / rect.height) * 100 - halfH);
          onStickerDrop(draggingRef.current.src, x, y);
        }
      }
      draggingRef.current = null;
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, boardRef, onStickerDrop]);

  const handleMouseDown = (e: React.MouseEvent, src: string) => {
    e.preventDefault();
    const state = { src, x: e.clientX, y: e.clientY };
    draggingRef.current = state;
    setDragging(state);
  };

  return (
    <>
      <div className={styles.grid}>
        {AVAILABLE_STICKERS.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`${styles.thumb} ${dragging?.src === src ? styles.hidden : ''}`}
            draggable={false}
            onMouseDown={(e) => handleMouseDown(e, src)}
          />
        ))}
      </div>

      {dragging &&
        createPortal(
          <img
            src={dragging.src}
            alt=""
            style={{
              position: 'fixed',
              left: dragging.x - 32,
              top: dragging.y - 32,
              width: 64,
              height: 64,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 99999,
              transform: 'scale(1.15)',
              transformOrigin: 'center center',
            }}
            draggable={false}
          />,
          document.body
        )}
    </>
  );
}

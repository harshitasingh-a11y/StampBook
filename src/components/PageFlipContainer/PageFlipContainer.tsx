import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, ImageIcon, Film, Pencil, Trash2, Check } from 'lucide-react';
import type { Page, Stamp } from '@/types/page';
import { usePagesStore } from '@/stores/pagesStore';
import { useBooksStore } from '@/stores/booksStore';
import { uploadMedia } from '@/lib/storageService';
import { playPageFlip } from '@/utils/playPageFlip';
import { useAssetUrl, useAssetUrls } from '@/hooks/useAssetUrl';
import PaperTexture from '@/components/PaperTexture/PaperTexture';
import styles from './PageFlipContainer.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(vid.duration); };
    vid.onerror = () => resolve(Infinity);
    vid.src = url;
  });
}

// ─── Subtle halftone dot overlay ──────────────────────────────────────────────

function DitheredImage({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedSrc = useAssetUrl(src);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cachedSrc) return;

    const img = new Image();
    if (!cachedSrc.startsWith('blob:') && !cachedSrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const displayW = canvas.parentElement?.offsetWidth  ?? img.naturalWidth;
      const displayH = canvas.parentElement?.offsetHeight ?? img.naturalHeight;

      // object-fit: cover crop math
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canAspect = displayW / displayH;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAspect > canAspect) {
        sh = img.naturalHeight; sw = sh * canAspect;
        sx = (img.naturalWidth  - sw) / 2; sy = 0;
      } else {
        sw = img.naturalWidth;  sh = sw / canAspect;
        sx = 0; sy = (img.naturalHeight - sh) / 2;
      }

      canvas.width  = displayW;
      canvas.height = displayH;
      const ctx = canvas.getContext('2d')!;

      // Step 1: Draw the original image at full quality
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, displayW, displayH);

      // Step 2: Get pixel data to sample brightness
      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, displayW, displayH);
      } catch {
        return; // CORS blocked — original photo already drawn
      }
      const data = imageData.data;

      // Step 3: Draw a subtle dot overlay based on local brightness
      const dotSize    = 2;
      const spacing    = 5;
      const maxOpacity = 0.18;

      ctx.save();
      for (let y = 0; y < displayH; y += spacing) {
        for (let x = 0; x < displayW; x += spacing) {
          const idx = (y * displayW + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const brightness = (r + g + b) / 765; // 0 (dark) → 1 (light)

          // Only draw dots in mid-to-bright areas for a natural halftone feel
          const opacity = brightness * maxOpacity;

          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }
      ctx.restore();
    };

    img.src = cachedSrc;
  }, [cachedSrc]);

  return <canvas ref={canvasRef} className={className} />;
}

// ─── VideoPlayer component for handling multiple video clips with caching ────

interface VideoPlayerProps {
  clips: string[];
}

function VideoPlayer({ clips }: VideoPlayerProps) {
  const [clipIndex, setClipIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Get cached URLs for all clips
  const cachedClips = useAssetUrls(clips);

  useEffect(() => {
    clips.forEach((_, i) => {
      const v = videoRefs.current[i];
      if (!v) return;
      if (i === clipIndex) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [clipIndex, clips.length]);

  const handleVideoEnded = () => setClipIndex((i) => (i + 1) % clips.length);

  // Capture first frame and paint the same halftone dot overlay as DitheredImage
  const paintOverlay = useCallback((video: HTMLVideoElement) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const offCtx = off.getContext('2d')!;
    offCtx.drawImage(video, 0, 0, w, h);

    let imageData: ImageData;
    try {
      imageData = offCtx.getImageData(0, 0, w, h);
    } catch {
      return; // cross-origin frame — skip overlay
    }
    const data = imageData.data;

    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);

    const dotSize    = 2;
    const spacing    = 5;
    const maxOpacity = 0.18;

    ctx.save();
    for (let y = 0; y < h; y += spacing) {
      for (let x = 0; x < w; x += spacing) {
        const idx = (y * w + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 765;
        const opacity = brightness * maxOpacity;
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }
    }
    ctx.restore();
  }, []);

  return (
    <>
      {cachedClips.map((cachedClip, i) => (
        <video
          key={clips[i]}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={cachedClip ?? clips[i]}
          className={styles.stampVideo}
          style={{ display: i === clipIndex ? 'block' : 'none' }}
          muted
          playsInline
          preload="auto"
          onCanPlay={(e) => {
            if (i === clipIndex) {
              e.currentTarget.play().catch(() => {});
              paintOverlay(e.currentTarget);
            }
          }}
          onEnded={i === clipIndex ? handleVideoEnded : undefined}
        />
      ))}
      {/* Halftone dot overlay — sits above the video, pointer-events: none */}
      <canvas
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ─── StampImageArea ───────────────────────────────────────────────────────────

interface StampImageAreaProps {
  stamp: Stamp | null;
  pageId: string;
  editable?: boolean;
}

function StampImageArea({ stamp, pageId, editable }: StampImageAreaProps) {
  const setStamp = usePagesStore((s) => s.setStamp);
  const removeStamp = usePagesStore((s) => s.removeStamp);
  const uid = useBooksStore((s) => s.uid);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgAreaRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  const clips = stamp?.videoClips ?? [];
  const hasMedia = !!stamp?.mediaUrl;
  const isVideo = stamp?.mediaType === 'video';
  const cachedMediaUrl = useAssetUrl(stamp?.mediaUrl ?? null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inImg = imgAreaRef.current?.contains(e.target as Node);
      const inDrop = dropdownRef.current?.contains(e.target as Node);
      if (!inImg && !inDrop) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    if (hasMedia) return; // has media: use hover icons instead
    if (!dropdownOpen && imgAreaRef.current) {
      const rect = imgAreaRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 10, left: rect.left + rect.width / 2 });
    }
    setDropdownOpen((o) => !o);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setDropdownOpen(false);
    setUploading(true);
    try {
      const url = await uploadMedia(uid, pageId, file);
      setStamp(pageId, 0, { mediaUrl: url, mediaType: 'photo', videoClips: undefined });
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const processVideoFiles = async (files: File[], existingClips: string[] = []) => {
    if (!uid) return;
    setError(null);
    setUploading(true);
    const validClips: string[] = [];
    const skipped: string[] = [];
    const remaining = 4 - existingClips.length;

    for (const file of files.slice(0, remaining)) {
      const dur = await getVideoDuration(file);
      if (dur > 5) { skipped.push(file.name); continue; }
      try {
        const url = await uploadMedia(uid, pageId, file);
        validClips.push(url);
      } catch {
        skipped.push(file.name);
      }
    }

    setUploading(false);
    if (skipped.length) setError(`Skipped (>5s or failed): ${skipped.join(', ')}`);

    const allClips = [...existingClips, ...validClips];
    if (allClips.length === 0) {
      setError('All videos exceed 5 seconds. Please choose shorter clips.');
      return;
    }
    setStamp(pageId, 0, { mediaUrl: allClips[0], mediaType: 'video', videoClips: allClips });
    setDropdownOpen(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await processVideoFiles(files);
    e.target.value = '';
  };

  const handleEditVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    // Add to existing clips (up to 4 total)
    await processVideoFiles(files, clips);
    e.target.value = '';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeStamp(pageId, 0);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo) {
      editVideoInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  return (
    <div className={styles.stampImgWrap}>
      <div
        ref={imgAreaRef}
        className={`${styles.stampImg} ${!hasMedia && editable ? styles.stampImgClickable : ''}`}
        onClick={handleAreaClick}
        onMouseEnter={() => editable && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {uploading ? (
          <div className={styles.stampImgBlank}>
            <div className={styles.uploadSpinner} />
          </div>
        ) : isVideo && clips.length > 0 ? (
          <VideoPlayer clips={clips} />
        ) : hasMedia && !isVideo ? (
          <DitheredImage src={stamp!.mediaUrl!} className={styles.stampPhoto} />
        ) : hasMedia ? (
          <img src={cachedMediaUrl ?? stamp!.mediaUrl!} alt="" className={styles.stampPhoto} />
        ) : (
          <div className={styles.stampImgBlank}>
            <Camera size={16} className={styles.stampAddIcon} />
          </div>
        )}

        {/* Edit / Delete overlay — shown on hover when media exists and editable */}
        {hasMedia && hovered && editable && (
          <div className={styles.mediaOverlay} onClick={(e) => e.stopPropagation()}>
            <button className={styles.mediaOverlayBtn} onClick={handleEdit} title={isVideo ? 'Add more clips' : 'Replace image'}>
              <Pencil size={12} />
            </button>
            <button className={`${styles.mediaOverlayBtn} ${styles.mediaOverlayBtnDelete}`} onClick={handleDelete} title="Remove">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Portalled dropdown — escapes stamp's CSS mask clipping */}
      {dropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          className={styles.mediaDropdown}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, transform: 'translateX(-50%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.mediaOption} onClick={() => imageInputRef.current?.click()}>
            <ImageIcon size={13} /> Upload Image
          </button>
          <button className={styles.mediaOption} onClick={() => videoInputRef.current?.click()}>
            <Film size={13} /> Upload Videos
          </button>
          {error && <p className={styles.mediaError}>{error}</p>}
        </div>,
        document.body
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple hidden onChange={handleVideoUpload} />
      <input ref={editVideoInputRef} type="file" accept="video/*" multiple hidden onChange={handleEditVideoUpload} />
    </div>
  );
}

interface Props {
  pages: Page[];
  accentColor: string;
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  readOnly?: boolean;
  onUpdateText?: (pageId: string, text: string) => void;
  onDeletePage?: (pageId: string) => void;
}

type Flip = { dir: 1 | -1; fromIdx: number; toIdx: number };

/* ─── Left page face: journal text ──────────────────────────────── */
interface LeftFaceProps {
  page: Page;
  idx: number;
  editable?: boolean;
  onTextSave?: (text: string) => void;
  onEditingChange?: (editing: boolean) => void;
}

function LeftFace({ page, idx, editable, onTextSave, onEditingChange }: LeftFaceProps) {
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(page.journalText ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft when navigating to a different page
  useEffect(() => {
    setDraftText(page.journalText ?? '');
    setEditing(false);
  }, [page.id]);

  // Sync draftText when journalText is updated externally (e.g. shared view save propagation)
  useEffect(() => {
    if (!editing) {
      setDraftText(page.journalText ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.journalText]);

  // Use draftText for display so the UI updates immediately after save (before prop propagation)
  const paragraphs = draftText.split('\n\n');
  const isEmpty = !draftText.trim();

  const handleBodyClick = () => {
    if (!editable) return;
    setEditing(true);
    onEditingChange?.(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setEditing(false);
    onEditingChange?.(false);
    onTextSave?.(draftText.trim());
  };

  return (
    <div className={styles.faceLeft}>
      <div className={styles.faceInner}>
        {page.postmarkDate && (
          <p className={styles.faceDate}>{page.postmarkDate}</p>
        )}
        {editing ? (
          <textarea
            ref={textareaRef}
            className={styles.faceTextarea}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            placeholder="Write something here about your memory..."
          />
        ) : (
          <div
            className={`${styles.faceBody} ${editable ? styles.faceBodyEditable : ''}`}
            onClick={handleBodyClick}
          >
            {isEmpty ? (
              <p className={styles.facePlaceholder}>Write something here about your memory...</p>
            ) : (
              paragraphs.map((p, i) => (
                <p key={i} className={`${styles.facePara} ${i === 0 ? styles.dropcap : ''}`}>
                  {p}
                </p>
              ))
            )}
          </div>
        )}
      </div>
      <div className={styles.pageNum}>{idx + 1}</div>
    </div>
  );
}

/* ─── Right page face: stamp + postmark ─────────────────────────── */
function RightFace({ page, accentColor, idx, editable }: { page: Page; accentColor: string; idx: number; editable?: boolean }) {
  const stamp = page.stamps[0] ?? null;
  const updateStampTitle = usePagesStore((s) => s.updateStampTitle);
  const updateStampSubheading = usePagesStore((s) => s.updateStampSubheading);

  const isExistingPage = !!page.postmarkLocation;
  // Derived fallbacks for existing pages
  const derivedTitle = isExistingPage
    ? (page.postmarkLocation ?? '').toUpperCase().replace(', SRI LANKA', '').trim() || 'TRAVEL'
    : '';
  const derivedYear = isExistingPage ? page.postmarkDate.slice(0, 4) : '';

  // The displayed title/year: stored override first, then derived fallback
  const displayTitle = page.stampTitle ?? derivedTitle;
  const displayYear  = page.stampSubheading ?? derivedYear;

  const titleRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (titleRef.current) titleRef.current.textContent = displayTitle;
  }, [page.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (subRef.current) subRef.current.textContent = displayYear;
  }, [page.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.faceRight}>
      <div className={styles.faceInner}>
        <div className={styles.stampWrap}>
          <div className={styles.stamp}>
            <StampImageArea stamp={stamp} pageId={page.id} editable={editable} />
            <div className={styles.stampMeta}>
              <div className={styles.stampTexts}>
                <span
                  ref={titleRef}
                  className={styles.stampTitle}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  data-placeholder="Add Stamp Title"
                  onBlur={(e) => editable && updateStampTitle(page.id, e.currentTarget.textContent ?? '')}
                  onClick={(e) => e.stopPropagation()}
                />
                <span
                  ref={subRef}
                  className={styles.stampYear}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  data-placeholder="Add subheading"
                  onBlur={(e) => editable && updateStampSubheading(page.id, e.currentTarget.textContent ?? '')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className={styles.stampDots}>
                <div className={styles.dot1} />
                <div className={styles.dot2} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.postmark} style={{ color: accentColor }}>
          <div className={styles.postmarkRing}>
            <span className={styles.postmarkDate}>{page.postmarkDate}</span>
            {page.postmarkLocation && (
              <span className={styles.postmarkLoc}>{page.postmarkLocation}</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.pageNum}>{idx + 1}</div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function PageFlipContainer({ pages, accentColor, currentIndex, onIndexChange, readOnly, onUpdateText, onDeletePage }: Props) {
  const [flip, setFlip] = useState<Flip | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isFlipping = flip !== null;
  const lastFlippedIdxRef = useRef(currentIndex);
  const storeUpdateJournalText = usePagesStore((s) => s.updateJournalText);
  const storeDeletePage = usePagesStore((s) => s.deletePage);

  // Use custom handlers if provided (for shared books), otherwise use store
  const updateJournalText = onUpdateText || storeUpdateJournalText;
  const deletePage = onDeletePage || storeDeletePage;

  // Auto-enter edit mode for empty pages, exit edit mode when switching pages
  // Don't allow edit mode for read-only (shared) books
  useEffect(() => {
    const page = pages[currentIndex];
    if (!page || readOnly) {
      setIsEditMode(false);
      return;
    }
    const isEmpty = !page.journalText?.trim() && page.stamps.length === 0;
    setIsEditMode(isEmpty);
  }, [currentIndex, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerFlip = useCallback(
    (next: number, dir: 1 | -1) => {
      if (isFlipping) return;
      if (next < 0 || next >= pages.length) return;
      playPageFlip();
      lastFlippedIdxRef.current = next;
      setFlip({ dir, fromIdx: currentIndex, toIdx: next });
      onIndexChange(next);
    },
    [isFlipping, currentIndex, pages.length, onIndexChange],
  );

  // Detect external currentIndex changes (e.g. "New Page") and animate the flip
  useEffect(() => {
    if (lastFlippedIdxRef.current !== currentIndex && !isFlipping) {
      const from = lastFlippedIdxRef.current;
      const to = currentIndex;
      lastFlippedIdxRef.current = to;
      if (from >= 0 && from < pages.length && to >= 0 && to < pages.length) {
        playPageFlip();
        setFlip({ dir: to > from ? 1 : -1, fromIdx: from, toIdx: to });
      }
    }
  }, [currentIndex, isFlipping, pages.length]);

  const goForward = useCallback(() => triggerFlip(currentIndex + 1, 1), [currentIndex, triggerFlip]);
  const goBack    = useCallback(() => triggerFlip(currentIndex - 1, -1), [currentIndex, triggerFlip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditingText) return;
      if (e.key === 'ArrowRight') goForward();
      else if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goForward, goBack, isEditingText]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isFlipping || isEditingText) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goForward();
      else goBack();
    }
  }, [isFlipping, isEditingText, goForward, goBack]);

  if (!pages[currentIndex]) return null;

  /*
   * What to render in each layer:
   *
   * Normal (no flip):
   *   leftStatic  = text(currentIndex)
   *   rightStatic = stamp(currentIndex)
   *
   * Forward flip (N → N+1):
   *   leftStatic  = text(N)           [stays, doesn't move]
   *   rightStatic = stamp(N+1)        [visible behind turn page]
   *   turnPage    = right half, rotateY 0 → -180, origin 0% 50%
   *     front     = stamp(N)
   *     back      = text(N+1)         [lands on left after flip]
   *
   * Backward flip (N → N-1):
   *   leftStatic  = text(N-1)         [visible behind turn page]
   *   rightStatic = stamp(N)          [stays, doesn't move]
   *   turnPage    = left half, rotateY 0 → +180, origin 100% 50%
   *     front     = text(N)
   *     back      = stamp(N-1)        [lands on right after flip]
   */
  const fromPage = flip ? pages[flip.fromIdx] : pages[currentIndex];
  const toPage   = flip ? pages[flip.toIdx]   : null;

  const leftStaticPage  = flip?.dir === -1 ? toPage!   : fromPage;
  const rightStaticPage = flip?.dir ===  1 ? toPage!   : fromPage;
  const leftStaticIdx   = flip?.dir === -1 ? flip.toIdx   : (flip?.fromIdx ?? currentIndex);
  const rightStaticIdx  = flip?.dir ===  1 ? flip.toIdx   : (flip?.fromIdx ?? currentIndex);

  return (
    <div
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <div className={styles.scene}>
        <div className={styles.bookShell}>

          {/* ── Page action icons — above teal shape, top-right ── */}
          {!readOnly && (
            <div className={styles.pageActions}>
              {isEditMode && (
                <button
                  className={styles.saveBtn}
                  onClick={() => setIsEditMode(false)}
                  aria-label="Save changes"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              )}
              {([
                { icon: <Pencil size={16} />, label: 'Edit this page', onClick: () => setIsEditMode(true), active: isEditMode },
                { icon: <Trash2 size={16} />, label: 'Delete this page', danger: true, onClick: () => setShowDeleteConfirm(true) },
              ] as { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void; active?: boolean }[]).map(({ icon, label, danger, onClick, active }) => (
                <div key={label} className={styles.actionWrap}>
                  <button
                    className={`${styles.actionBtn} ${danger ? styles.actionBtnDanger : ''} ${active ? styles.actionBtnActive : ''}`}
                    aria-label={label}
                    onClick={onClick}
                  >
                    {icon}
                  </button>
                  <span className={styles.tooltip}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Book cover (behind pages) ──────────────────────── */}
          <div className={styles.bookCoverBg}>
            <div className={styles.coverLeft}>
              <img src="/static/openbookleftshape.png" className={styles.coverLeftImg} alt="" />
            </div>
            <div className={styles.coverRight}>
              <img src="/static/openbookrightshape.png" className={styles.coverRightImg} alt="" />
            </div>
          </div>

          {/* ── Binder clip ───────────────────────────────────── */}
          <img src="/static/clip.svg" className={styles.binderClip} alt="" />

        <div className={styles.bookFrame}>

          {/* ── Left static page ──────────────────────────────── */}
          <div className={styles.pageLeft}>
            <PaperTexture seed={leftStaticIdx * 2} foxing={leftStaticIdx % 4 === 0} />
            {leftStaticPage && (
              <LeftFace
                page={leftStaticPage}
                idx={leftStaticIdx}
                editable={isEditMode && !isFlipping}
                onTextSave={(text) => updateJournalText(leftStaticPage.id, text)}
                onEditingChange={setIsEditingText}
              />
            )}
          </div>

          {/* ── Right static page (behind turn page) ──────────── */}
          <div className={styles.pageRight}>
            <PaperTexture seed={rightStaticIdx * 2 + 1} />
            {rightStaticPage && (
              <RightFace page={rightStaticPage} accentColor={accentColor} idx={rightStaticIdx} editable={isEditMode && !isFlipping} />
            )}
          </div>

          {/* ── Spine ─────────────────────────────────────────── */}
          <div className={styles.spine} />

          {/* ── 3D turn page (forward: right half) ────────────── */}
          <AnimatePresence>
            {isFlipping && flip.dir === 1 && (
              <motion.div
                key="turn-forward"
                className={styles.turnRight}
                style={{ transformStyle: 'preserve-3d', transformOrigin: '0% 50%' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.0] }}
                onAnimationComplete={() => setFlip(null)}
              >
                <div className={`${styles.pageFace} ${styles.pageFront}`}>
                  <PaperTexture seed={flip.fromIdx * 2 + 1} />
                  <RightFace page={fromPage} accentColor={accentColor} idx={flip.fromIdx} />
                  <div className={styles.frontShadow} />
                </div>
                <div className={`${styles.pageFace} ${styles.pageBack} ${styles.pageBackRight}`}>
                  <PaperTexture seed={flip.toIdx * 2} foxing={flip.toIdx % 4 === 0} />
                  {toPage && <LeftFace page={toPage} idx={flip.toIdx} />}
                  <div className={styles.backSpineShadow} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 3D turn page (backward: left half) ────────────── */}
          <AnimatePresence>
            {isFlipping && flip.dir === -1 && (
              <motion.div
                key="turn-backward"
                className={styles.turnLeft}
                style={{ transformStyle: 'preserve-3d', transformOrigin: '100% 50%' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.0] }}
                onAnimationComplete={() => setFlip(null)}
              >
                <div className={`${styles.pageFace} ${styles.pageFront} ${styles.pageFrontLeft}`}>
                  <PaperTexture seed={flip.fromIdx * 2} foxing={flip.fromIdx % 4 === 0} />
                  <LeftFace page={fromPage} idx={flip.fromIdx} />
                  <div className={styles.frontShadowLeft} />
                </div>
                <div className={`${styles.pageFace} ${styles.pageBack} ${styles.pageBackLeft}`}>
                  <PaperTexture seed={flip.toIdx * 2 + 1} />
                  {toPage && <RightFace page={toPage} accentColor={accentColor} idx={flip.toIdx} />}
                  <div className={styles.backSpineShadowRight} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Cast shadows ──────────────────────────────────── */}
          {isFlipping && (
            <div
              className={
                flip.dir === 1 ? styles.castShadowRight : styles.castShadowLeft
              }
            />
          )}

          {/* ── Navigation zones ──────────────────────────────── */}
          {currentIndex > 0 && (
            <button className={`${styles.navZone} ${styles.navPrev}`} onClick={goBack} aria-label="Previous page">
              <span className={styles.navArrow}><ChevronLeft size={18} /></span>
            </button>
          )}
          {currentIndex < pages.length - 1 && (
            <button className={`${styles.navZone} ${styles.navNext}`} onClick={goForward} aria-label="Next page">
              <span className={styles.navArrow}><ChevronRight size={18} /></span>
            </button>
          )}

          {/* ── Page indicator ────────────────────────────────── */}
          <div className={styles.pageIndicator}>
            <button
              className={styles.pageIndicatorBtn}
              onClick={() => triggerFlip(0, -1)}
              disabled={currentIndex === 0}
              aria-label="Go to first page"
            >
              1
            </button>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((currentIndex + 1) / pages.length) * 100}%` }}
              />
            </div>
            <button
              className={styles.pageIndicatorBtn}
              onClick={() => triggerFlip(pages.length - 1, 1)}
              disabled={currentIndex === pages.length - 1}
              aria-label="Go to last page"
            >
              {pages.length}
            </button>
          </div>
        </div>{/* bookFrame */}
        </div>{/* bookShell */}

      {/* ── Delete confirmation dialog ─────────────────────────── */}
      {showDeleteConfirm && createPortal(
        <div className={styles.confirmOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.confirmText}>Are you sure you want to delete this whole page?</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDelete}
                onClick={() => {
                  deletePage(pages[currentIndex].id);
                  setShowDeleteConfirm(false);
                  // Navigate to adjacent page
                  const nextIdx = currentIndex > 0 ? currentIndex - 1 : 0;
                  onIndexChange(nextIdx);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}

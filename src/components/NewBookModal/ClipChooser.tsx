import { CLIP_OPTIONS } from '@/types/book';
import styles from './ClipChooser.module.css';

interface ClipChooserProps {
  selected: string;
  onChange: (key: string) => void;
}

export default function ClipChooser({ selected, onChange }: ClipChooserProps) {
  return (
    <div className={styles.row}>
      {CLIP_OPTIONS.map((clip) => (
        <button
          key={clip.key}
          type="button"
          className={`${styles.option} ${selected === clip.key ? styles.active : ''}`}
          onClick={() => onChange(clip.key)}
          aria-label={clip.label}
        >
          <img src={clip.src} alt={clip.label} className={styles.clipImg} draggable={false} />
        </button>
      ))}
    </div>
  );
}

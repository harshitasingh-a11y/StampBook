import { Check } from 'lucide-react';
import { THEME_HEX } from '@/types/book';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  selected: string;
  onChange: (theme: string) => void;
}

const themeKeys = Object.keys(THEME_HEX);

export default function ColorPicker({ selected, onChange }: ColorPickerProps) {
  return (
    <div className={styles.picker}>
      {themeKeys.map((key) => (
        <button
          key={key}
          type="button"
          className={`${styles.swatch} ${selected === key ? styles.active : ''}`}
          style={{ backgroundColor: THEME_HEX[key] }}
          onClick={() => onChange(key)}
          aria-label={key}
        >
          {selected === key && (
            <Check size={14} strokeWidth={2.5} color="#fff" />
          )}
        </button>
      ))}
    </div>
  );
}

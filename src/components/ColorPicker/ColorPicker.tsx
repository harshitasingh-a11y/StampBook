import { useRef } from 'react';
import { Check } from 'lucide-react';
import { THEME_HEX } from '@/types/book';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  selected: string;
  onChange: (theme: string) => void;
}

const themeKeys = Object.keys(THEME_HEX);

// A custom color is any value not in the preset theme keys
const isCustomColor = (value: string) => value.startsWith('#');

export default function ColorPicker({ selected, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const customActive = isCustomColor(selected);

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

      {/* Custom color swatch */}
      <button
        type="button"
        className={`${styles.swatch} ${styles.customSwatch} ${customActive ? styles.active : ''}`}
        style={customActive ? { backgroundColor: selected } : undefined}
        onClick={() => inputRef.current?.click()}
        aria-label="Custom color"
      >
        {customActive && <Check size={14} strokeWidth={2.5} color="#fff" />}
        <input
          ref={inputRef}
          type="color"
          className={styles.colorInput}
          value={customActive ? selected : '#c4683c'}
          onChange={(e) => onChange(e.target.value)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </button>
    </div>
  );
}

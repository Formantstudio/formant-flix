import { useRef } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.wrap}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        placeholder="Search videos…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search videos"
      />
      {value && (
        <button className={styles.clear} onClick={() => onChange("")} aria-label="Clear search">✕</button>
      )}
    </div>
  );
}

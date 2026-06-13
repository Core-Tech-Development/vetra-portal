import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const isExternalUpdate = useRef(false);

  // Sync internal state when external value changes
  useEffect(() => {
    isExternalUpdate.current = true;
    setInternalValue(value);
  }, [value]);

  // Debounce internal value changes to parent
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange]);

  function handleClear() {
    setInternalValue("");
    onChange("");
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} aria-hidden="true">
        <Search size={16} />
      </span>
      <input
        type="search"
        className={styles.input}
        value={internalValue}
        onChange={(e) => {
          isExternalUpdate.current = false;
          setInternalValue(e.target.value);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {internalValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { SearchInput } from "../ui";
import styles from "./SearchFilterBar.module.css";

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: SearchFilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
      {filters && <div className={styles.filters}>{filters}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

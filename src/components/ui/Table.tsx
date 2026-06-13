import type { ReactNode } from "react";
import styles from "./Table.module.css";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
  loadingRows = 5,
  emptyState,
}: TableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? styles.sortable : undefined}
                onClick={
                  col.sortable && onSort
                    ? () => onSort(col.key)
                    : undefined
                }
                aria-sort={
                  sortColumn === col.key
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.header}
                {col.sortable && sortColumn === col.key && (
                  <span className={styles.sortIndicator} aria-hidden="true">
                    {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className={styles.skeletonRow}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.cell}>
                    <div className={styles.skeletonBlock} />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading &&
            data.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
              </tr>
            ))}
          {!isLoading && data.length === 0 && emptyState && (
            <tr>
              <td colSpan={columns.length} className={styles.emptyCell}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

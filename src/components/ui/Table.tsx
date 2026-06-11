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
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
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
          {data.map((row) => (
            <tr key={keyExtractor(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

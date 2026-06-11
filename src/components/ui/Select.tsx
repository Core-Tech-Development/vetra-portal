import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./Select.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  selectSize?: "sm" | "md";
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, helperText, selectSize = "md", id, children, className, ...rest },
    ref
  ) {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText && !error ? `${selectId}-helper` : undefined;

    const selectClassNames = [
      styles.select,
      styles[selectSize],
      error ? styles.error : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.wrapper}>
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={selectClassNames}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? helperId}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <span id={errorId} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

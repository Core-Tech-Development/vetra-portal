import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  inputSize?: "sm" | "md";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, inputSize = "md", id, className, ...rest },
  ref
) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;

  const inputClassNames = [
    styles.input,
    styles[inputSize],
    error ? styles.error : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={inputClassNames}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId ?? helperId}
        {...rest}
      />
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
});

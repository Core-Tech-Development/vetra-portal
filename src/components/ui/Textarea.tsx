import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, helperText, id, className, ...rest }, ref) {
    const textareaId =
      id ?? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText && !error ? `${textareaId}-helper` : undefined;

    const textareaClassNames = [
      styles.textarea,
      error ? styles.error : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.wrapper}>
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClassNames}
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
  }
);

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  inputSize?: "sm" | "md";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    inputSize = "md",
    leftIcon,
    rightIcon,
    id,
    className,
    required,
    ...rest
  },
  ref
) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;

  const isRequired = required || rest["aria-required"] === true || rest["aria-required"] === "true";

  const inputClassNames = [
    styles.input,
    styles[inputSize],
    leftIcon ? styles.hasLeftIcon : "",
    rightIcon ? styles.hasRightIcon : "",
    error ? styles.error : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputElement = (
    <input
      ref={ref}
      id={inputId}
      className={inputClassNames}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId ?? helperId}
      required={required}
      {...rest}
    />
  );

  const hasIcons = leftIcon || rightIcon;

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {isRequired && (
          <span className={styles.requiredIndicator} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hasIcons ? (
        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          {inputElement}
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
      ) : (
        inputElement
      )}
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

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";
import { colors } from "../../styles/tokens";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading ? styles.loading : "",
    fullWidth ? styles.fullWidth : "",
    iconOnly ? styles.iconOnly : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && (
        <span className={styles.spinnerWrapper}>
          <Spinner
            size="sm"
            color={variant === "primary" || variant === "danger" ? colors.surface : undefined}
          />
        </span>
      )}
      {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
      {!iconOnly && <span className={styles.label}>{children}</span>}
      {iconOnly && children}
      {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
    </button>
  );
}

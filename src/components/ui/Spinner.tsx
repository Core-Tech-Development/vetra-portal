import type { CSSProperties } from "react";
import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function Spinner({ size = "md", color }: SpinnerProps) {
  const className = [styles.spinner, styles[size]].join(" ");

  const style: CSSProperties | undefined = color
    ? { borderTopColor: color }
    : undefined;

  return (
    <span
      className={className}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}

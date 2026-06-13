import type { ReactNode } from "react";
import styles from "./FieldDisplay.module.css";

interface FieldDisplayProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

export function FieldDisplay({ label, value, fullWidth = false }: FieldDisplayProps) {
  const rootClassName = [styles.root, fullWidth ? styles.fullWidth : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

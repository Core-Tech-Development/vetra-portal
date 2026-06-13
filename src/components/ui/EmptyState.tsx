import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  size?: "sm" | "md";
}

export function EmptyState({ icon, title, description, action, size = "md" }: EmptyStateProps) {
  const wrapperClass = [styles.wrapper, size === "sm" ? styles.sm : ""].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  );
}

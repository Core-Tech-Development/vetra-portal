import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  );
}

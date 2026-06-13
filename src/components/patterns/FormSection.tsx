import type { ReactNode } from "react";
import styles from "./FormSection.module.css";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  const hasHeader = title || description;

  return (
    <section className={styles.root}>
      {hasHeader && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      <div className={styles.fields}>{children}</div>
    </section>
  );
}

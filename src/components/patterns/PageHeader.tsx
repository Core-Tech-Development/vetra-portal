import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "../ui/icons";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backLink?: {
    label: string;
    to: string;
  };
}

export function PageHeader({ title, subtitle, actions, backLink }: PageHeaderProps) {
  return (
    <header className={styles.root}>
      {backLink && (
        <Link to={backLink.to} className={styles.backLink}>
          <span className={styles.backLinkIcon}>
            <ArrowLeft size={16} aria-hidden="true" />
          </span>
          {backLink.label}
        </Link>
      )}

      <div className={styles.row}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}

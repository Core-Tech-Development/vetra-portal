import type { ReactNode, HTMLAttributes } from "react";
import styles from "./Card.module.css";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  noPadding?: boolean;
  children: ReactNode;
}

const variantClassMap: Record<CardVariant, string | undefined> = {
  default: undefined,
  elevated: styles.elevated,
  interactive: styles.interactive,
};

export function Card({
  title,
  header,
  footer,
  variant = "default",
  noPadding = false,
  children,
  className,
  ...rest
}: CardProps) {
  const classNames = [
    styles.card,
    variantClassMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...rest}>
      {header && <div className={styles.header}>{header}</div>}
      {title && !header && <h3 className={styles.title}>{title}</h3>}
      <div className={noPadding ? styles.bodyNoPadding : styles.body}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

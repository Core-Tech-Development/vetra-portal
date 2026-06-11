import type { ReactNode, HTMLAttributes } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  noPadding?: boolean;
  children: ReactNode;
}

export function Card({
  title,
  noPadding = false,
  children,
  className,
  ...rest
}: CardProps) {
  const classNames = [
    styles.card,
    noPadding ? styles.noPadding : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...rest}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}

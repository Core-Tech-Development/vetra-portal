import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = "neutral", children }: BadgeProps) {
  const classNames = [styles.badge, styles[variant]].join(" ");

  return <span className={classNames}>{children}</span>;
}

import type { ReactNode } from "react";
import { Card } from "../ui";
import styles from "./DetailSection.module.css";

interface DetailSectionProps {
  title?: string;
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

const columnClassMap: Record<2 | 3 | 4, string> = {
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
};

export function DetailSection({
  title,
  columns = 3,
  children,
  className,
}: DetailSectionProps) {
  const gridClassName = [styles.grid, columnClassMap[columns]]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <Card title={title}>
        <div className={gridClassName}>{children}</div>
      </Card>
    </div>
  );
}

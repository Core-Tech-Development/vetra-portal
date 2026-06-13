import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, Skeleton } from "../ui";
import { TrendingUp, TrendingDown, Minus } from "../ui/icons";
import styles from "./StatCard.module.css";

interface StatCardTrend {
  value: string;
  direction: "up" | "down" | "neutral";
}

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  isLoading?: boolean;
  trend?: StatCardTrend;
  href?: string;
}

const trendConfig = {
  up: { className: styles.trendUp, Icon: TrendingUp },
  down: { className: styles.trendDown, Icon: TrendingDown },
  neutral: { className: styles.trendNeutral, Icon: Minus },
} as const;

function TrendIndicator({ trend }: { trend: StatCardTrend }) {
  const { className, Icon } = trendConfig[trend.direction];

  return (
    <span className={`${styles.trend} ${className}`}>
      <Icon size={14} aria-hidden="true" />
      {trend.value}
    </span>
  );
}

function StatCardContent({ icon, value, label, isLoading, trend }: Omit<StatCardProps, "href">) {
  return (
    <div className={styles.root}>
      <div className={styles.iconCircle} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.content}>
        {isLoading ? (
          <>
            <Skeleton className={styles.valueSkeleton} />
            <Skeleton className={styles.labelSkeleton} />
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              <span className={styles.value}>{value}</span>
              {trend && <TrendIndicator trend={trend} />}
            </div>
            <span className={styles.label}>{label}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function StatCard({ icon, value, label, isLoading, trend, href }: StatCardProps) {
  const card = (
    <Card className={styles.cardWrapper}>
      <StatCardContent
        icon={icon}
        value={value}
        label={label}
        isLoading={isLoading}
        trend={trend}
      />
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className={styles.link}>
        {card}
      </Link>
    );
  }

  return card;
}

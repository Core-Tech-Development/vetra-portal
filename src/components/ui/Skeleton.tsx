import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: "text" | "circular" | "rectangular";
  lines?: number;
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = "rectangular",
  lines,
  className,
}: SkeletonProps) {
  if (variant === "text" && lines && lines > 1) {
    return (
      <div className={className} role="status" aria-label="Loading">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.textLine}`}
            style={{ width: i === lines - 1 ? undefined : width }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const variantClass = styles[variant];

  return (
    <div
      className={[styles.skeleton, variantClass, className]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

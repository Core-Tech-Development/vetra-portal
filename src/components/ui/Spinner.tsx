import type { CSSProperties } from "react";
import { colors, motion } from "../../styles/tokens";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeMap: Record<string, string> = {
  sm: "1rem",
  md: "1.5rem",
  lg: "2.5rem",
};

export function Spinner({ size = "md", color = colors.primary }: SpinnerProps) {
  const dimension = sizeMap[size];

  const style: CSSProperties = {
    width: dimension,
    height: dimension,
    border: `2px solid ${colors.border}`,
    borderTopColor: color,
    borderRadius: "50%",
    animation: `vetra-spin ${motion.slow} linear infinite`,
    flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes vetra-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={style} role="status" aria-label="Loading" />
    </>
  );
}

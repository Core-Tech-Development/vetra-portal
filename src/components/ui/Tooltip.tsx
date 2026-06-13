import { useState, useRef, useCallback, cloneElement } from "react";
import type { ReactElement } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  content: string;
  children: ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  const positionClass = styles[position];

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {cloneElement(children, {
        "aria-describedby": visible ? "tooltip" : undefined,
      })}
      {visible && (
        <div
          role="tooltip"
          id="tooltip"
          className={`${styles.tooltip} ${positionClass}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

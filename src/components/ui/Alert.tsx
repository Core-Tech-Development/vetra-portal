import type { ReactNode } from "react";
import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from "lucide-react";
import styles from "./Alert.module.css";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}

const VARIANT_ICON: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Alert({ variant, title, children, onDismiss }: AlertProps) {
  const Icon = VARIANT_ICON[variant];
  const variantClass = styles[variant];
  const classNames = [styles.alert, variantClass].join(" ");

  return (
    <div className={classNames} role="alert">
      <span className={styles.icon}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.message}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

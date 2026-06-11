import { useState, useCallback, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: styles.success,
  error: styles.errorVariant,
  warning: styles.warning,
  info: styles.info,
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className={styles.container} aria-live="polite">
          {toasts.map((toast) => (
            <ToastEntry
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastEntry({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`${styles.toast} ${VARIANT_CLASS[toast.variant]}`}
      role="status"
    >
      <span>{toast.message}</span>
      <button
        className={styles.closeButton}
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}

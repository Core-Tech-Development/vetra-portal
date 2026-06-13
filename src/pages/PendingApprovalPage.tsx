import { Clock, XCircle } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Button, Alert } from "../components/ui";
import styles from "./PendingApprovalPage.module.css";

interface PendingApprovalPageProps {
  status: string;
}

export function PendingApprovalPage({ status }: PendingApprovalPageProps) {
  const { logout } = useAuth();

  const isSuspended = status === "SUSPENDED";

  return (
    <div className={styles.page}>
      <div className={isSuspended ? styles.iconSuspended : styles.icon}>
        {isSuspended ? (
          <XCircle size={64} aria-hidden="true" />
        ) : (
          <Clock size={64} aria-hidden="true" />
        )}
      </div>

      <h1 className={styles.title}>
        {isSuspended ? "Account suspended" : "Approval pending"}
      </h1>

      <p className={styles.description}>
        {isSuspended
          ? "Your account has been suspended. Please contact support for more information."
          : "Your registration is being reviewed by the Vetra team. You will receive a notification when your account is approved."}
      </p>

      <div className={styles.alertContainer}>
        <Alert variant="info">
          {isSuspended
            ? "If you believe this is an error, please reach out to our support team for assistance."
            : "This process usually takes up to 48 hours. You will be notified by email once your account is approved."}
        </Alert>
      </div>

      <Button variant="secondary" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}

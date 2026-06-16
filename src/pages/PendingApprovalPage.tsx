import { Clock, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";
import { Button, Alert } from "../components/ui";
import styles from "./PendingApprovalPage.module.css";

interface PendingApprovalPageProps {
  status: string;
}

export function PendingApprovalPage({ status }: PendingApprovalPageProps) {
  const { logout } = useAuth();
  const { t } = useTranslation("auth");

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
        {isSuspended
          ? t("pendingApproval.titleSuspended")
          : t("pendingApproval.titlePending")}
      </h1>

      <p className={styles.description}>
        {isSuspended
          ? t("pendingApproval.descriptionSuspended")
          : t("pendingApproval.descriptionPending")}
      </p>

      <div className={styles.alertContainer}>
        <Alert variant="info">
          {isSuspended
            ? t("pendingApproval.alertSuspended")
            : t("pendingApproval.alertPending")}
        </Alert>
      </div>

      <Button variant="secondary" onClick={logout}>
        {t("common:actions.signOut")}
      </Button>
    </div>
  );
}

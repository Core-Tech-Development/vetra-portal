import { useTranslation } from "react-i18next";
import { Badge } from "./Badge";
import type { BadgeVariant } from "./Badge";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  CREATED: "neutral",
  PENDING_APPROVAL: "warning",
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "danger",
  WAITING_SPECIALIST_ACCEPTANCE: "warning",
  ACCEPTED: "info",
  SCHEDULED: "info",
  IN_TRANSIT: "info",
  IN_SERVICE: "info",
  IN_PROGRESS: "info",
  EXAM_DONE: "success",
  WAITING_REPORT: "warning",
  REPORT_ISSUED: "success",
  COMPLETED: "success",
  FINISHED: "success",
  CANCELLED: "danger",
  CANCELED: "danger",
  NOT_PERFORMED: "danger",
  REJECTED: "danger",
  PENDING_PAYMENT_CREATION: "warning",
  PAYMENT_CREATED: "info",
  PAYMENT_CONFIRMED: "success",
  PAYMENT_RECEIVED: "success",
  PAYMENT_OVERDUE: "danger",
  PAYMENT_REFUNDED: "neutral",
  FAILED: "danger",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation("common");
  const variant = STATUS_VARIANT[status] ?? "neutral";
  const label = t(`status.${status}`, {
    defaultValue: status.replace(/_/g, " ").toLowerCase(),
  });

  return <Badge variant={variant}>{label}</Badge>;
}

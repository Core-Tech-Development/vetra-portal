import { Badge } from "./Badge";
import type { BadgeVariant } from "./Badge";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  CREATED: { label: "Created", variant: "neutral" },
  PENDING_APPROVAL: { label: "Pending approval", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Inactive", variant: "neutral" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
  WAITING_SPECIALIST_ACCEPTANCE: {
    label: "Waiting specialist acceptance",
    variant: "warning",
  },
  ACCEPTED: { label: "Accepted", variant: "info" },
  SCHEDULED: { label: "Scheduled", variant: "info" },
  IN_TRANSIT: { label: "In transit", variant: "info" },
  IN_SERVICE: { label: "In service", variant: "info" },
  IN_PROGRESS: { label: "In progress", variant: "info" },
  EXAM_DONE: { label: "Exam done", variant: "success" },
  WAITING_REPORT: { label: "Waiting report", variant: "warning" },
  REPORT_ISSUED: { label: "Report issued", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  FINISHED: { label: "Finished", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  CANCELED: { label: "Canceled", variant: "danger" },
  NOT_PERFORMED: { label: "Not performed", variant: "danger" },
  REJECTED: { label: "Rejected", variant: "danger" },
  PENDING_PAYMENT_CREATION: { label: "Pending", variant: "warning" },
  PAYMENT_CREATED: { label: "Awaiting payment", variant: "info" },
  PAYMENT_CONFIRMED: { label: "Confirmed", variant: "success" },
  PAYMENT_RECEIVED: { label: "Received", variant: "success" },
  PAYMENT_OVERDUE: { label: "Overdue", variant: "danger" },
  PAYMENT_REFUNDED: { label: "Refunded", variant: "neutral" },
  FAILED: { label: "Failed", variant: "danger" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " ").toLowerCase(),
    variant: "neutral" as BadgeVariant,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

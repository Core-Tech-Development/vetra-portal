import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  Stethoscope,
  ClipboardCheck,
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  Bell,
} from "../ui/icons";
import { markAsRead } from "../../api/notifications";
import type { NotificationResponse } from "../../api/types";
import styles from "./NotificationItem.module.css";

const TYPE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  EXAM_REQUEST_CREATED: FileText,
  APPOINTMENT_SCHEDULED: Calendar,
  APPOINTMENT_ACCEPTED: CheckCircle,
  APPOINTMENT_DECLINED: XCircle,
  SPECIALIST_IN_TRANSIT: Truck,
  EXAM_IN_SERVICE: Stethoscope,
  EXAM_COMPLETED: ClipboardCheck,
  LAUDO_ISSUED: FileText,
  APPOINTMENT_COMPLETED: CheckCircle,
  APPOINTMENT_CANCELLED: XCircle,
  APPOINTMENT_NO_SHOW: AlertTriangle,
  CLINIC_APPROVED: Building2,
  SPECIALIST_APPROVED: Users,
  BILLING_RECORD_CREATED: CreditCard,
};

function getNotificationRoute(
  referenceType: string | null,
  referenceId: string | null
): string | null {
  if (!referenceType || !referenceId) return null;
  const routes: Record<string, (id: string) => string> = {
    APPOINTMENT: (id) => `/appointments/${id}`,
    EXAM_REQUEST: (id) => `/exam-requests/${id}`,
    LAUDO: (id) => `/laudos/${id}`,
    CLINIC: (id) => `/clinics/${id}`,
    SPECIALIST: (id) => `/specialists/${id}`,
    BILLING_RECORD: (id) => `/admin/billing/${id}`,
  };
  return routes[referenceType]?.(referenceId) ?? null;
}

function getRelativeTime(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t("notifications:timeAgo.justNow");
  if (diffMin < 60) return t("notifications:timeAgo.minutesAgo", { count: diffMin });
  if (diffHours < 24) return t("notifications:timeAgo.hoursAgo", { count: diffHours });
  return t("notifications:timeAgo.daysAgo", { count: diffDays });
}

interface NotificationItemProps {
  notification: NotificationResponse;
  size?: "default" | "large";
  onClose?: () => void;
}

export function NotificationItem({ notification, size = "default", onClose }: NotificationItemProps) {
  const { t } = useTranslation("notifications");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: () => markAsRead(notification.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const route = getNotificationRoute(notification.referenceType, notification.referenceId);
  const typeName = t(`types.${notification.type}`, { defaultValue: notification.type });

  const handleClick = () => {
    if (!notification.read) {
      markAsReadMutation.mutate();
    }
    if (route) {
      navigate(route);
    }
    onClose?.();
  };

  const itemClasses = [
    styles.item,
    !notification.read ? styles.unread : "",
    size === "large" ? styles.large : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={itemClasses} onClick={handleClick}>
      <span className={styles.iconWrapper} aria-hidden="true">
        <Icon size={size === "large" ? 18 : 16} />
      </span>
      <div className={styles.content}>
        <p className={styles.subject}>
          {notification.subject ?? typeName}
        </p>
        <p className={styles.typeName}>{typeName}</p>
      </div>
      <span className={styles.time}>
        {getRelativeTime(notification.createdAt, t)}
      </span>
      {!notification.read && <span className={styles.unreadDot} aria-hidden="true" />}
    </button>
  );
}

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listNotifications, markAllAsRead } from "../../api/notifications";
import { Spinner, EmptyState, Bell } from "../ui";
import { NotificationItem } from "./NotificationItem";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./NotificationPanel.module.css";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { t } = useTranslation("notifications");
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => listNotifications(0, 10),
    staleTime: STALE_TIMES.realtime,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const notifications = data?.content ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div ref={panelRef} className={styles.panel} role="dialog" aria-label={t("title")}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>{t("title")}</h2>
        {hasUnread && (
          <button
            type="button"
            className={styles.markAllButton}
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {isLoading && (
          <div className={styles.loadingWrapper}>
            <Spinner size="md" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <EmptyState
            icon={<Bell size={24} />}
            title={t("empty.title")}
            description={t("empty.description")}
            size="sm"
          />
        )}

        {!isLoading &&
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))}
      </div>

      <div className={styles.footer}>
        <Link
          to="/notifications"
          className={styles.viewAllLink}
          onClick={onClose}
        >
          {t("viewAll")}
        </Link>
      </div>
    </div>
  );
}

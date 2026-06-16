import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listNotifications, markAllAsRead } from "../../api/notifications";
import { Button, Spinner, EmptyState, Pagination, Tabs, TabList, Tab, Bell } from "../../components/ui";
import { PageHeader } from "../../components/patterns";
import { NotificationItem } from "../../components/notifications/NotificationItem";
import styles from "./NotificationsPage.module.css";

type FilterTab = "all" | "unread";

export function NotificationsPage() {
  const { t } = useTranslation(["notifications", "common"]);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<FilterTab>("all");

  const unreadOnly = filter === "unread";

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page", page, filter],
    queryFn: () => listNotifications(page, 20, unreadOnly),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const notifications = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterTab);
    setPage(0);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("notifications:title")}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
          >
            {t("notifications:markAllRead")}
          </Button>
        }
      />

      <Tabs value={filter} onChange={handleFilterChange}>
        <TabList>
          <Tab value="all">{t("notifications:filters.all")}</Tab>
          <Tab value="unread">{t("notifications:filters.unread")}</Tab>
        </TabList>
      </Tabs>

      <div className={styles.card}>
        {isLoading && (
          <div className={styles.loadingWrapper}>
            <Spinner size="md" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={<Bell size={32} />}
              title={t("notifications:empty.title")}
              description={t("notifications:empty.description")}
            />
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <>
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  size="large"
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

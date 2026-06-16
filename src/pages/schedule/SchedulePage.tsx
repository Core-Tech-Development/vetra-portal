import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSlot, listSlots, deleteSlot, blockSlot } from "../../api/availabilitySlots";
import {
  Button,
  Card,
  Spinner,
  EmptyState,
  StatusBadge,
} from "../../components/ui";
import { PageHeader } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import { formatDateTime } from "../../i18n/formatting";
import styles from "./SchedulePage.module.css";

export function SchedulePage() {
  const { t } = useTranslation(['schedule', 'common']);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // TODO: Get specialistId from user context
  const specialistId = localStorage.getItem("vetra_specialist_id") || "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["slots", specialistId, page],
    queryFn: () => listSlots(specialistId, page, 20),
    enabled: !!specialistId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createSlot(specialistId, {
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      }),
    onSuccess: () => {
      showToast(t('schedule:toast.slotCreated'), "success");
      setStartAt("");
      setEndAt("");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast(t('schedule:toast.slotCreateFailed'), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: () => {
      showToast(t('schedule:toast.slotDeleted'), "success");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast(t('schedule:toast.slotDeleteFailed'), "error"),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => blockSlot(id),
    onSuccess: () => {
      showToast(t('schedule:toast.slotBlocked'), "success");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast(t('schedule:toast.slotBlockFailed'), "error"),
  });

  const canCreate = startAt !== "" && endAt !== "";

  if (!specialistId) {
    return (
      <div>
        <PageHeader
          title={t('schedule:title')}
          subtitle={t('schedule:subtitle')}
        />
        <Card>
          <EmptyState
            title={t('schedule:noSpecialist.title')}
            description={t('schedule:noSpecialist.description')}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('schedule:title')}
        subtitle={t('schedule:subtitle')}
      />

      {/* Add Slot Form */}
      <div className={styles.addSlotForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldGroupLabel} htmlFor="slot-start">
            {t('schedule:fields.start')}
          </label>
          <input
            id="slot-start"
            type="datetime-local"
            className={styles.fieldGroupInput}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldGroupLabel} htmlFor="slot-end">
            {t('schedule:fields.end')}
          </label>
          <input
            id="slot-end"
            type="datetime-local"
            className={styles.fieldGroupInput}
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          isLoading={createMutation.isPending}
          disabled={!canCreate}
        >
          {t('schedule:addSlot')}
        </Button>
      </div>

      {/* Slots List */}
      <Card noPadding>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>{t('schedule:error.title')}</div>
            <p className={styles.errorDetail}>
              {t('schedule:error.detail')}
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              {t('common:actions.retry')}
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title={t('schedule:empty.title')}
            description={t('schedule:empty.description')}
          />
        )}

        {data && data.content.length > 0 && (
          <>
            {data.content.map((slot) => (
              <div key={slot.id} className={styles.slotItem}>
                <div className={styles.slotTime}>
                  <span className={styles.slotLabel}>
                    {formatDateTime(slot.startAt)} &mdash;{" "}
                    {formatDateTime(slot.endAt)}
                  </span>
                  <span className={styles.slotDate}>
                    <StatusBadge status={slot.status} />
                  </span>
                </div>
                <div className={styles.slotActions}>
                  {slot.status !== "BLOCKED" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => blockMutation.mutate(slot.id)}
                      isLoading={blockMutation.isPending}
                    >
                      {t('common:actions.block')}
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(slot.id)}
                    isLoading={deleteMutation.isPending}
                  >
                    {t('common:actions.delete')}
                  </Button>
                </div>
              </div>
            ))}

            {data.totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t('common:actions.previous')}
                </Button>
                <span className={styles.pageInfo}>
                  {t('schedule:pagination.pageOf', { current: page + 1, total: data.totalPages })}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common:actions.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

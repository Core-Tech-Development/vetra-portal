import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  listSlots,
  listSlotsByDateRange,
  deleteSlot,
  blockSlot,
} from "../../api/availabilitySlots";
import type { SlotResponse } from "../../api/types";
import {
  Button,
  Card,
  Spinner,
  EmptyState,
  StatusBadge,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Dialog,
} from "../../components/ui";
import { PageHeader } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import { formatDateTime } from "../../i18n/formatting";
import { WeeklyCalendar } from "../../components/schedule/WeeklyCalendar";
import { CreateSlotDialog } from "../../components/schedule/CreateSlotDialog";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./SchedulePage.module.css";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay: 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatSlotTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function SchedulePage() {
  const { t } = useTranslation(["schedule", "common"]);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("week");
  const [listPage, setListPage] = useState(0);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  // Create slot dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitialDate, setDialogInitialDate] = useState<string | undefined>();
  const [dialogInitialHour, setDialogInitialHour] = useState<number | undefined>();

  // Slot action dialog state
  const [actionSlot, setActionSlot] = useState<SlotResponse | null>(null);

  const specialistId = localStorage.getItem("vetra_specialist_id") || "";

  // Calendar date range
  const weekFrom = useMemo(() => formatDateISO(weekStart), [weekStart]);
  const weekTo = useMemo(() => formatDateISO(addDays(weekStart, 6)), [weekStart]);

  // Calendar query
  const {
    data: calendarSlots,
    isLoading: isCalendarLoading,
  } = useQuery({
    queryKey: ["slots-calendar", specialistId, weekFrom, weekTo],
    queryFn: () => listSlotsByDateRange(specialistId, weekFrom, weekTo),
    enabled: !!specialistId && activeTab === "week",
    staleTime: STALE_TIMES.list,
  });

  // List query
  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["slots", specialistId, listPage],
    queryFn: () => listSlots(specialistId, listPage, 20),
    enabled: !!specialistId && activeTab === "list",
    staleTime: STALE_TIMES.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: () => {
      showToast(t("schedule:toast.slotDeleted"), "success");
      setActionSlot(null);
      invalidateAll();
    },
    onError: () => showToast(t("schedule:toast.slotDeleteFailed"), "error"),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => blockSlot(id),
    onSuccess: () => {
      showToast(t("schedule:toast.slotBlocked"), "success");
      setActionSlot(null);
      invalidateAll();
    },
    onError: () => showToast(t("schedule:toast.slotBlockFailed"), "error"),
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["slots-calendar", specialistId] });
    queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
  }

  const handlePreviousWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleToday = useCallback(() => {
    setWeekStart(getMonday(new Date()));
  }, []);

  const handleCreateSlotFromCalendar = useCallback((date: Date, hour: number) => {
    setDialogInitialDate(formatDateISO(date));
    setDialogInitialHour(hour);
    setDialogOpen(true);
  }, []);

  const handleSlotClick = useCallback((slot: SlotResponse) => {
    setActionSlot(slot);
  }, []);

  const openCreateDialog = useCallback(() => {
    setDialogInitialDate(undefined);
    setDialogInitialHour(undefined);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    invalidateAll();
  }, []);

  if (!specialistId) {
    return (
      <div>
        <PageHeader
          title={t("schedule:title")}
          subtitle={t("schedule:subtitle")}
        />
        <Card>
          <EmptyState
            title={t("schedule:noSpecialist.title")}
            description={t("schedule:noSpecialist.description")}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("schedule:title")}
        subtitle={t("schedule:subtitle")}
        actions={
          <Button onClick={openCreateDialog}>
            <Plus size={16} />
            {t("schedule:createSlot.title")}
          </Button>
        }
      />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="week">{t("schedule:tabs.week")}</Tab>
          <Tab value="list">{t("schedule:tabs.list")}</Tab>
        </TabList>

        <TabPanel value="week" activeValue={activeTab}>
          <div className={styles.tabContent}>
            <WeeklyCalendar
              weekStart={weekStart}
              slots={calendarSlots || []}
              onCreateSlot={handleCreateSlotFromCalendar}
              onSlotClick={handleSlotClick}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              onToday={handleToday}
              isLoading={isCalendarLoading}
            />
          </div>
        </TabPanel>

        <TabPanel value="list" activeValue={activeTab}>
          <div className={styles.tabContent}>
            <Card noPadding>
              {isListLoading && (
                <div className={styles.loadingContainer}>
                  <Spinner size="lg" />
                </div>
              )}

              {isListError && (
                <div className={styles.errorBox}>
                  <div className={styles.errorTitle}>
                    {t("schedule:error.title")}
                  </div>
                  <p className={styles.errorDetail}>
                    {t("schedule:error.detail")}
                  </p>
                  <Button variant="secondary" onClick={() => refetchList()}>
                    {t("common:actions.retry")}
                  </Button>
                </div>
              )}

              {listData && listData.content.length === 0 && (
                <EmptyState
                  title={t("schedule:empty.title")}
                  description={t("schedule:empty.description")}
                />
              )}

              {listData && listData.content.length > 0 && (
                <>
                  {listData.content.map((slot) => (
                    <div key={slot.id} className={styles.slotItem}>
                      <div className={styles.slotInfo}>
                        <span className={styles.slotTimeLabel}>
                          {formatDateTime(slot.startAt)} &mdash;{" "}
                          {formatDateTime(slot.endAt)}
                        </span>
                        <div className={styles.slotMeta}>
                          <StatusBadge status={slot.status} />
                          {slot.label && (
                            <span className={styles.slotLabelBadge}>
                              {slot.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.slotActions}>
                        {slot.status === "AVAILABLE" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => blockMutation.mutate(slot.id)}
                            isLoading={blockMutation.isPending}
                          >
                            {t("common:actions.block")}
                          </Button>
                        )}
                        {(slot.status === "AVAILABLE" || slot.status === "BLOCKED") && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteMutation.mutate(slot.id)}
                            isLoading={deleteMutation.isPending}
                          >
                            {t("common:actions.delete")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {listData.totalPages > 1 && (
                    <div className={styles.pagination}>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={listPage === 0}
                        onClick={() => setListPage((p) => p - 1)}
                      >
                        {t("common:actions.previous")}
                      </Button>
                      <span className={styles.pageInfo}>
                        {t("schedule:pagination.pageOf", {
                          current: listPage + 1,
                          total: listData.totalPages,
                        })}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={listPage + 1 >= listData.totalPages}
                        onClick={() => setListPage((p) => p + 1)}
                      >
                        {t("common:actions.next")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </TabPanel>
      </Tabs>

      <CreateSlotDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        specialistId={specialistId}
        initialDate={dialogInitialDate}
        initialHour={dialogInitialHour}
        onSuccess={handleDialogSuccess}
      />

      {/* Slot action dialog */}
      <Dialog
        open={actionSlot !== null}
        onClose={() => setActionSlot(null)}
        title={t("schedule:slotActions.title")}
        size="sm"
      >
        {actionSlot && (
          <div className={styles.actionDialog}>
            <div className={styles.actionSlotInfo}>
              <span className={styles.actionSlotTime}>
                {formatSlotTime(actionSlot.startAt)} &mdash;{" "}
                {formatSlotTime(actionSlot.endAt)}
              </span>
              <StatusBadge status={actionSlot.status} />
              {actionSlot.label && (
                <span className={styles.slotLabelBadge}>{actionSlot.label}</span>
              )}
            </div>

            <div className={styles.actionButtons}>
              {actionSlot.status === "AVAILABLE" && (
                <Button
                  variant="secondary"
                  onClick={() => blockMutation.mutate(actionSlot.id)}
                  isLoading={blockMutation.isPending}
                >
                  {t("schedule:slotActions.block")}
                </Button>
              )}
              {(actionSlot.status === "AVAILABLE" || actionSlot.status === "BLOCKED") && (
                <Button
                  variant="danger"
                  onClick={() => deleteMutation.mutate(actionSlot.id)}
                  isLoading={deleteMutation.isPending}
                >
                  {t("schedule:slotActions.delete")}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setActionSlot(null)}>
                {t("common:actions.cancel")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

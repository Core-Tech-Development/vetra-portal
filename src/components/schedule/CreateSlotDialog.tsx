import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { createSlot, createBulkSlots } from "../../api/availabilitySlots";
import { Dialog, Button, Input, Tabs, TabList, Tab, TabPanel } from "../ui";
import { useToast } from "../ui/Toast";
import styles from "./CreateSlotDialog.module.css";

interface CreateSlotDialogProps {
  open: boolean;
  onClose: () => void;
  specialistId: string;
  initialDate?: string;
  initialHour?: number;
  onSuccess: () => void;
}

const DAY_OPTIONS = [
  { value: "MONDAY", key: "mon" },
  { value: "TUESDAY", key: "tue" },
  { value: "WEDNESDAY", key: "wed" },
  { value: "THURSDAY", key: "thu" },
  { value: "FRIDAY", key: "fri" },
  { value: "SATURDAY", key: "sat" },
  { value: "SUNDAY", key: "sun" },
] as const;

const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2h" },
] as const;

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function countRecurringSlots(
  startDate: string,
  endDate: string,
  daysOfWeek: string[],
  startTime: string,
  endTime: string,
  slotDurationMinutes: number | null
): { totalSlots: number; daysMatched: number; slotsPerDay: number } {
  if (!startDate || !endDate || daysOfWeek.length === 0) {
    return { totalSlots: 0, daysMatched: 0, slotsPerDay: 0 };
  }

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { totalSlots: 0, daysMatched: 0, slotsPerDay: 0 };
  }

  const dayMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };

  const selectedDayNumbers = daysOfWeek
    .map((d) => dayMap[d])
    .filter((n) => n !== undefined);

  let daysMatched = 0;
  const current = new Date(start);
  while (current <= end) {
    if (selectedDayNumbers.includes(current.getDay())) {
      daysMatched++;
    }
    current.setDate(current.getDate() + 1);
  }

  let slotsPerDay = 1;
  if (slotDurationMinutes && startTime && endTime) {
    const totalMinutes = parseMinutes(endTime) - parseMinutes(startTime);
    if (totalMinutes > 0 && slotDurationMinutes > 0) {
      slotsPerDay = Math.floor(totalMinutes / slotDurationMinutes);
    }
  }

  return {
    totalSlots: daysMatched * slotsPerDay,
    daysMatched,
    slotsPerDay,
  };
}

function getErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  return null;
}

export function CreateSlotDialog({
  open,
  onClose,
  specialistId,
  initialDate,
  initialHour,
  onSuccess,
}: CreateSlotDialogProps) {
  const { t } = useTranslation(["schedule", "common"]);
  const { showToast } = useToast();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [activeTab, setActiveTab] = useState<string>("single");

  // Single slot fields
  const [singleDate, setSingleDate] = useState(initialDate || today);
  const [singleStartTime, setSingleStartTime] = useState(
    initialHour !== undefined ? formatHour(initialHour) : ""
  );
  const [singleEndTime, setSingleEndTime] = useState(
    initialHour !== undefined ? formatHour(initialHour + 1) : ""
  );
  const [singleLabel, setSingleLabel] = useState("");

  // Recurring slot fields
  const [recurStartDate, setRecurStartDate] = useState(today);
  const [recurEndDate, setRecurEndDate] = useState("");
  const [recurDays, setRecurDays] = useState<string[]>([]);
  const [recurStartTime, setRecurStartTime] = useState("08:00");
  const [recurEndTime, setRecurEndTime] = useState("18:00");
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [recurTimezone] = useState(detectedTimezone);
  const [recurLabel, setRecurLabel] = useState("");
  const [slotDuration, setSlotDuration] = useState<number | null>(60);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const preview = useMemo(
    () =>
      countRecurringSlots(
        recurStartDate,
        recurEndDate,
        recurDays,
        recurStartTime,
        recurEndTime,
        slotDuration
      ),
    [recurStartDate, recurEndDate, recurDays, recurStartTime, recurEndTime, slotDuration]
  );

  const singleMutation = useMutation({
    mutationFn: () => {
      const startAt = new Date(`${singleDate}T${singleStartTime}:00`).toISOString();
      const endAt = new Date(`${singleDate}T${singleEndTime}:00`).toISOString();
      return createSlot(specialistId, {
        startAt,
        endAt,
        label: singleLabel || undefined,
      });
    },
    onSuccess: () => {
      showToast(t("schedule:toast.slotCreated"), "success");
      resetAndClose();
      onSuccess();
    },
    onError: (error) => {
      const detail = getErrorMessage(error);
      if (detail?.toLowerCase().includes("overlap")) {
        showToast(t("schedule:toast.overlapError"), "error");
      } else {
        showToast(t("schedule:toast.slotCreateFailed"), "error");
      }
    },
  });

  const bulkMutation = useMutation({
    mutationFn: () => {
      setBulkError(null);
      return createBulkSlots(specialistId, {
        startDate: recurStartDate,
        endDate: recurEndDate,
        daysOfWeek: recurDays,
        startTime: recurStartTime,
        endTime: recurEndTime,
        label: recurLabel || undefined,
        timezone: recurTimezone,
        slotDurationMinutes: slotDuration ?? undefined,
      });
    },
    onSuccess: (data) => {
      showToast(
        t("schedule:toast.bulkCreated", { count: data.length }),
        "success"
      );
      resetAndClose();
      onSuccess();
    },
    onError: (error) => {
      const detail = getErrorMessage(error);
      if (detail?.toLowerCase().includes("overlap")) {
        setBulkError(t("schedule:toast.overlapError"));
      } else if (detail) {
        setBulkError(detail);
      } else {
        setBulkError(t("schedule:toast.bulkCreateFailed"));
      }
    },
  });

  function resetAndClose() {
    setSingleDate(today);
    setSingleStartTime("");
    setSingleEndTime("");
    setSingleLabel("");
    setRecurStartDate(today);
    setRecurEndDate("");
    setRecurDays([]);
    setRecurStartTime("08:00");
    setRecurEndTime("18:00");
    setRecurLabel("");
    setSlotDuration(60);
    setBulkError(null);
    setActiveTab("single");
    onClose();
  }

  function toggleDay(day: string) {
    setRecurDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function selectWeekdays() {
    setRecurDays(WEEKDAYS);
  }

  function selectAllDays() {
    setRecurDays(DAY_OPTIONS.map((d) => d.value));
  }

  function clearDays() {
    setRecurDays([]);
  }

  const isAllWeekdays =
    WEEKDAYS.every((d) => recurDays.includes(d)) &&
    recurDays.length === WEEKDAYS.length;
  const isAllDays = recurDays.length === 7;

  // Validation
  const singleTimeError =
    singleStartTime && singleEndTime && singleStartTime >= singleEndTime
      ? t("schedule:createSlot.timeError")
      : null;

  const recurTimeError =
    recurStartTime && recurEndTime && recurStartTime >= recurEndTime
      ? t("schedule:createSlot.timeError")
      : null;

  const canSubmitSingle =
    singleDate !== "" &&
    singleStartTime !== "" &&
    singleEndTime !== "" &&
    !singleTimeError;

  const canSubmitBulk =
    recurStartDate !== "" &&
    recurEndDate !== "" &&
    recurDays.length > 0 &&
    recurStartTime !== "" &&
    recurEndTime !== "" &&
    !recurTimeError &&
    preview.totalSlots > 0;

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      title={t("schedule:createSlot.title")}
      size="md"
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="single">{t("schedule:createSlot.tabSingle")}</Tab>
          <Tab value="recurring">{t("schedule:createSlot.tabRecurring")}</Tab>
        </TabList>

        <TabPanel value="single" activeValue={activeTab}>
          <div className={styles.form}>
            <Input
              label={t("schedule:createSlot.date")}
              type="date"
              value={singleDate}
              min={today}
              onChange={(e) => setSingleDate(e.target.value)}
            />

            <div className={styles.fieldRow}>
              <Input
                label={t("schedule:createSlot.startTime")}
                type="time"
                value={singleStartTime}
                onChange={(e) => setSingleStartTime(e.target.value)}
              />
              <Input
                label={t("schedule:createSlot.endTime")}
                type="time"
                value={singleEndTime}
                onChange={(e) => setSingleEndTime(e.target.value)}
              />
            </div>

            {singleTimeError && (
              <div className={styles.errorMessage}>{singleTimeError}</div>
            )}

            <Input
              label={t("schedule:createSlot.label")}
              type="text"
              value={singleLabel}
              onChange={(e) => setSingleLabel(e.target.value)}
              placeholder={t("schedule:createSlot.labelPlaceholder")}
            />

            <div className={styles.actions}>
              <Button variant="secondary" onClick={resetAndClose}>
                {t("common:actions.cancel")}
              </Button>
              <Button
                onClick={() => singleMutation.mutate()}
                isLoading={singleMutation.isPending}
                disabled={!canSubmitSingle}
              >
                {t("schedule:createSlot.submit")}
              </Button>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="recurring" activeValue={activeTab}>
          <div className={styles.form}>
            {/* Date range */}
            <div className={styles.fieldRow}>
              <Input
                label={t("schedule:createSlot.startDate")}
                type="date"
                value={recurStartDate}
                min={today}
                onChange={(e) => setRecurStartDate(e.target.value)}
              />
              <Input
                label={t("schedule:createSlot.endDate")}
                type="date"
                value={recurEndDate}
                min={recurStartDate || today}
                onChange={(e) => setRecurEndDate(e.target.value)}
              />
            </div>

            {/* Days of week toggle buttons */}
            <div className={styles.daysSection}>
              <div className={styles.daysHeader}>
                <span className={styles.daysLabel}>
                  {t("schedule:createSlot.daysOfWeek")}
                </span>
                <div className={styles.daysShortcuts}>
                  <button
                    type="button"
                    className={`${styles.shortcutBtn} ${isAllWeekdays ? styles.shortcutActive : ""}`}
                    onClick={selectWeekdays}
                  >
                    {t("schedule:createSlot.weekdays")}
                  </button>
                  <button
                    type="button"
                    className={`${styles.shortcutBtn} ${isAllDays ? styles.shortcutActive : ""}`}
                    onClick={selectAllDays}
                  >
                    {t("schedule:createSlot.allDays")}
                  </button>
                  {recurDays.length > 0 && (
                    <button
                      type="button"
                      className={styles.shortcutBtn}
                      onClick={clearDays}
                    >
                      {t("schedule:createSlot.clearDays")}
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.daysGrid}>
                {DAY_OPTIONS.map((day) => {
                  const selected = recurDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={`${styles.dayToggle} ${selected ? styles.dayToggleActive : ""}`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {t(`schedule:days.${day.key}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time range */}
            <div className={styles.fieldRow}>
              <Input
                label={t("schedule:createSlot.startTime")}
                type="time"
                value={recurStartTime}
                onChange={(e) => setRecurStartTime(e.target.value)}
              />
              <Input
                label={t("schedule:createSlot.endTime")}
                type="time"
                value={recurEndTime}
                onChange={(e) => setRecurEndTime(e.target.value)}
              />
            </div>

            {recurTimeError && (
              <div className={styles.errorMessage}>{recurTimeError}</div>
            )}

            {/* Slot duration */}
            <div className={styles.durationSection}>
              <span className={styles.daysLabel}>
                {t("schedule:createSlot.slotDuration")}
              </span>
              <div className={styles.durationGrid}>
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.durationBtn} ${slotDuration === opt.value ? styles.durationBtnActive : ""}`}
                    onClick={() => setSlotDuration(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.durationBtn} ${slotDuration === null ? styles.durationBtnActive : ""}`}
                  onClick={() => setSlotDuration(null)}
                >
                  {t("schedule:createSlot.fullWindow")}
                </button>
              </div>
            </div>

            {/* Label */}
            <Input
              label={t("schedule:createSlot.label")}
              type="text"
              value={recurLabel}
              onChange={(e) => setRecurLabel(e.target.value)}
              placeholder={t("schedule:createSlot.labelPlaceholder")}
            />

            {/* Timezone info */}
            <div className={styles.timezoneInfo}>
              {t("schedule:createSlot.timezone")}: {recurTimezone}
            </div>

            {/* Preview */}
            <div
              className={`${styles.preview} ${preview.totalSlots > 0 ? styles.previewActive : ""}`}
            >
              {preview.totalSlots > 0 ? (
                <>
                  <span className={styles.previewCount}>
                    {preview.totalSlots}
                  </span>
                  <span className={styles.previewText}>
                    {t("schedule:createSlot.previewDetail", {
                      total: preview.totalSlots,
                      perDay: preview.slotsPerDay,
                      days: preview.daysMatched,
                    })}
                  </span>
                </>
              ) : (
                <span className={styles.previewText}>
                  {t("schedule:createSlot.previewZero")}
                </span>
              )}
            </div>

            {/* Error message */}
            {bulkError && (
              <div className={styles.errorMessage}>{bulkError}</div>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={resetAndClose}>
                {t("common:actions.cancel")}
              </Button>
              <Button
                onClick={() => bulkMutation.mutate()}
                isLoading={bulkMutation.isPending}
                disabled={!canSubmitBulk}
              >
                {t("schedule:createSlot.submitBulk")}
              </Button>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </Dialog>
  );
}

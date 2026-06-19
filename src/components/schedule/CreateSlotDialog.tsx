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

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function countRecurringSlots(
  startDate: string,
  endDate: string,
  daysOfWeek: string[]
): number {
  if (!startDate || !endDate || daysOfWeek.length === 0) return 0;

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  const dayMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const selectedDayNumbers = daysOfWeek
    .map((d) => dayMap[d])
    .filter((n) => n !== undefined);

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    if (selectedDayNumbers.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
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
  const [recurStartTime, setRecurStartTime] = useState("");
  const [recurEndTime, setRecurEndTime] = useState("");
  const [recurTimezone] = useState("America/Sao_Paulo");
  const [recurLabel, setRecurLabel] = useState("");

  const previewCount = useMemo(
    () => countRecurringSlots(recurStartDate, recurEndDate, recurDays),
    [recurStartDate, recurEndDate, recurDays]
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
    onError: () => {
      showToast(t("schedule:toast.slotCreateFailed"), "error");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: () =>
      createBulkSlots(specialistId, {
        startDate: recurStartDate,
        endDate: recurEndDate,
        daysOfWeek: recurDays,
        startTime: recurStartTime,
        endTime: recurEndTime,
        label: recurLabel || undefined,
        timezone: recurTimezone,
      }),
    onSuccess: (data) => {
      showToast(
        t("schedule:toast.bulkCreated", { count: data.length }),
        "success"
      );
      resetAndClose();
      onSuccess();
    },
    onError: () => {
      showToast(t("schedule:toast.bulkCreateFailed"), "error");
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
    setRecurStartTime("");
    setRecurEndTime("");
    setRecurLabel("");
    setActiveTab("single");
    onClose();
  }

  function toggleDay(day: string) {
    setRecurDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  const canSubmitSingle =
    singleDate !== "" && singleStartTime !== "" && singleEndTime !== "";
  const canSubmitBulk =
    recurStartDate !== "" &&
    recurEndDate !== "" &&
    recurDays.length > 0 &&
    recurStartTime !== "" &&
    recurEndTime !== "" &&
    previewCount > 0;

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

            <Input
              label={t("schedule:createSlot.label")}
              type="text"
              value={singleLabel}
              onChange={(e) => setSingleLabel(e.target.value)}
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

            <div className={styles.daysSection}>
              <span className={styles.daysLabel}>
                {t("schedule:createSlot.daysOfWeek")}
              </span>
              <div className={styles.daysGrid}>
                {DAY_OPTIONS.map((day) => (
                  <label key={day.value} className={styles.dayCheckbox}>
                    <input
                      type="checkbox"
                      checked={recurDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                    />
                    {t(`schedule:days.${day.key}`)}
                  </label>
                ))}
              </div>
            </div>

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

            <Input
              label={t("schedule:createSlot.timezone")}
              type="text"
              value={recurTimezone}
              readOnly
            />

            <Input
              label={t("schedule:createSlot.label")}
              type="text"
              value={recurLabel}
              onChange={(e) => setRecurLabel(e.target.value)}
            />

            <div className={styles.preview}>
              {previewCount > 0
                ? t("schedule:createSlot.preview", { count: previewCount })
                : t("schedule:createSlot.previewZero")}
            </div>

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

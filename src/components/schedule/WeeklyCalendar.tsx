import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Spinner } from "../ui";
import type { SlotResponse } from "../../api/types";
import styles from "./WeeklyCalendar.module.css";

interface WeeklyCalendarProps {
  weekStart: Date;
  slots: SlotResponse[];
  onCreateSlot?: (date: Date, hour: number) => void;
  onSlotClick?: (slot: SlotResponse) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isLoading?: boolean;
}

const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PX_PER_HOUR = 60;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayHeader(date: Date, dayLabel: string): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${dayLabel} ${day}/${month}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getSlotStatusClass(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return styles.slotAvailable;
    case "RESERVED":
      return styles.slotReserved;
    case "BLOCKED":
      return styles.slotBlocked;
    default:
      return styles.slotAvailable;
  }
}

export function WeeklyCalendar({
  weekStart,
  slots,
  onCreateSlot,
  onSlotClick,
  onPreviousWeek,
  onNextWeek,
  onToday,
  isLoading = false,
}: WeeklyCalendarProps) {
  const { t } = useTranslation(["schedule"]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = new Date();

  const slotsByDay = useMemo(() => {
    const map = new Map<string, SlotResponse[]>();
    for (const day of weekDays) {
      const key = day.toISOString().slice(0, 10);
      map.set(key, []);
    }
    for (const slot of slots) {
      const slotStart = new Date(slot.startAt);
      const key = `${slotStart.getFullYear()}-${String(slotStart.getMonth() + 1).padStart(2, "0")}-${String(slotStart.getDate()).padStart(2, "0")}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(slot);
      }
    }
    return map;
  }, [slots, weekDays]);

  const handleDayClick = useCallback(
    (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
      if (!onCreateSlot) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hour = Math.floor(y / PX_PER_HOUR) + START_HOUR;
      if (hour >= START_HOUR && hour < END_HOUR) {
        onCreateSlot(day, hour);
      }
    },
    [onCreateSlot]
  );

  const weekLabel = useMemo(() => {
    const d = weekDays[0];
    const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    return t("schedule:calendar.weekOf", { date: formatted });
  }, [weekDays, t]);

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = START_HOUR; i <= END_HOUR; i++) {
      h.push(i);
    }
    return h;
  }, []);

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <div className={styles.navigation}>
        <div className={styles.navButtons}>
          <Button variant="outline" size="sm" onClick={onPreviousWeek}>
            <ChevronLeft size={16} />
            {t("schedule:calendar.previousWeek")}
          </Button>
        </div>
        <div className={styles.navCenter}>
          {weekLabel}
        </div>
        <div className={styles.navButtons}>
          <Button variant="outline" size="sm" onClick={onToday}>
            {t("schedule:calendar.today")}
          </Button>
          <Button variant="outline" size="sm" onClick={onNextWeek}>
            {t("schedule:calendar.nextWeek")}
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingOverlay}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Header row */}
          <div className={styles.timeGutterHeader} />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`${styles.headerCell} ${isToday ? styles.headerToday : ""}`}
              >
                <span className={styles.headerDate}>
                  {formatDayHeader(
                    day,
                    t(`schedule:days.${DAY_KEYS[day.getDay()]}`)
                  )}
                </span>
              </div>
            );
          })}

          {/* Body: Time gutter + 7 day columns */}
          <div className={styles.timeGutter} style={{ height: GRID_HEIGHT }}>
            {hours.map((hour) => (
              <div
                key={hour}
                className={styles.timeLabel}
                style={{ top: (hour - START_HOUR) * PX_PER_HOUR }}
              >
                {`${String(hour).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => {
            const dayKey = day.toISOString().slice(0, 10);
            const daySlots = slotsByDay.get(dayKey) || [];

            return (
              <div
                key={dayIndex}
                className={styles.dayColumn}
                style={{ height: GRID_HEIGHT }}
                onClick={(e) => handleDayClick(day, e)}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={`h-${hour}`}
                    className={styles.hourLine}
                    style={{ top: (hour - START_HOUR) * PX_PER_HOUR }}
                  />
                ))}
                {/* Half-hour lines */}
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={`hh-${hour}`}
                    className={styles.halfHourLine}
                    style={{
                      top: (hour - START_HOUR) * PX_PER_HOUR + PX_PER_HOUR / 2,
                    }}
                  />
                ))}

                {/* Slot blocks */}
                {daySlots.map((slot) => {
                  const start = new Date(slot.startAt);
                  const end = new Date(slot.endAt);
                  const startMinutes =
                    (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                  const endMinutes =
                    (end.getHours() - START_HOUR) * 60 + end.getMinutes();
                  const top = (startMinutes / 60) * PX_PER_HOUR;
                  const height = Math.max(
                    ((endMinutes - startMinutes) / 60) * PX_PER_HOUR,
                    18
                  );

                  return (
                    <div
                      key={slot.id}
                      className={`${styles.slotBlock} ${getSlotStatusClass(slot.status)}`}
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick?.(slot);
                      }}
                      title={
                        slot.label
                          ? `${slot.label} (${formatTime(start)} - ${formatTime(end)})`
                          : `${formatTime(start)} - ${formatTime(end)}`
                      }
                    >
                      {slot.label && (
                        <div className={styles.slotLabel}>{slot.label}</div>
                      )}
                      <div className={styles.slotTime}>
                        {formatTime(start)} - {formatTime(end)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

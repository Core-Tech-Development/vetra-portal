import { useState } from "react";
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
import styles from "./SchedulePage.module.css";

function formatSlotDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function SchedulePage() {
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
      showToast("Slot created.", "success");
      setStartAt("");
      setEndAt("");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast("Failed to create slot.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: () => {
      showToast("Slot deleted.", "success");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast("Failed to delete slot.", "error"),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => blockSlot(id),
    onSuccess: () => {
      showToast("Slot blocked.", "success");
      queryClient.invalidateQueries({ queryKey: ["slots", specialistId] });
      refetch();
    },
    onError: () => showToast("Failed to block slot.", "error"),
  });

  const canCreate = startAt !== "" && endAt !== "";

  if (!specialistId) {
    return (
      <div>
        <PageHeader
          title="Schedule"
          subtitle="Manage your availability slots for appointments."
        />
        <Card>
          <EmptyState
            title="Specialist not configured"
            description="Your specialist profile is not linked. Please contact an administrator."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Manage your availability slots for appointments."
      />

      {/* Add Slot Form */}
      <div className={styles.addSlotForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldGroupLabel} htmlFor="slot-start">
            Start
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
            End
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
          Add slot
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
            <div className={styles.errorTitle}>Failed to load slots</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching availability slots. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No availability slots"
            description="You have not added any availability slots yet. Use the form above to create one."
          />
        )}

        {data && data.content.length > 0 && (
          <>
            {data.content.map((slot) => (
              <div key={slot.id} className={styles.slotItem}>
                <div className={styles.slotTime}>
                  <span className={styles.slotLabel}>
                    {formatSlotDateTime(slot.startAt)} &mdash;{" "}
                    {formatSlotDateTime(slot.endAt)}
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
                      Block
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(slot.id)}
                    isLoading={deleteMutation.isPending}
                  >
                    Delete
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
                  Previous
                </Button>
                <span className={styles.pageInfo}>
                  Page {page + 1} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

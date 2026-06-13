import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExamRequest, cancelExamRequest } from "../../api/examRequests";
import { getClinic } from "../../api/clinics";
import { getPatient } from "../../api/patients";
import { searchSpecialists } from "../../api/specialists";
import { createAppointment } from "../../api/appointments";
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  Spinner,
  Table,
  EmptyState,
  Dialog,
} from "../../components/ui";
import type { BadgeVariant, TableColumn } from "../../components/ui";
import type { SpecialistResponse } from "../../api/types";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import styles from "./ExamRequestDetailPage.module.css";

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function ExamRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [filterBySpecialty, setFilterBySpecialty] = useState(true);
  const [schedulingSpecialist, setSchedulingSpecialist] =
    useState<SpecialistResponse | null>(null);

  const {
    data: examRequest,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["exam-request", id],
    queryFn: () => getExamRequest(id!),
    enabled: !!id,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", examRequest?.patientId],
    queryFn: () => getPatient(examRequest!.patientId),
    enabled: !!examRequest?.patientId,
  });

  const { data: clinic } = useQuery({
    queryKey: ["clinic", examRequest?.clinicId],
    queryFn: () => getClinic(examRequest!.clinicId),
    enabled: !!examRequest?.clinicId,
  });

  const specialtyParam = filterBySpecialty ? examRequest?.examType : undefined;

  const {
    data: specialists,
    isLoading: isLoadingSpecialists,
    isError: isErrorSpecialists,
    refetch: refetchSpecialists,
  } = useQuery({
    queryKey: [
      "available-specialists",
      clinic?.city,
      clinic?.state,
      specialtyParam,
    ],
    queryFn: () =>
      searchSpecialists(clinic!.city, clinic!.state, specialtyParam),
    enabled: showSpecialists && !!clinic && !!examRequest,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelExamRequest(id!),
    onSuccess: () => {
      showToast("Exam request cancelled successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["exam-request", id] });
    },
    onError: () => {
      showToast("Failed to cancel exam request.", "error");
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (specialistId: string) =>
      createAppointment({ examRequestId: id!, specialistId }),
    onSuccess: () => {
      setSchedulingSpecialist(null);
      showToast("Appointment scheduled successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["exam-request", id] });
    },
    onError: () => {
      setSchedulingSpecialist(null);
      showToast("Failed to schedule appointment.", "error");
    },
  });

  const specialistColumns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className={styles.specialistName}>{row.name}</span>
      ),
    },
    {
      key: "crmv",
      header: "CRMV",
      render: (row) => `${row.crmv} / ${row.crmvState}`,
    },
    {
      key: "specialty",
      header: "Specialty",
      render: (row) => row.specialty.replace(/_/g, " "),
    },
    {
      key: "baseCity",
      header: "Base city",
      render: (row) =>
        row.baseCity && row.baseState
          ? `${row.baseCity} / ${row.baseState}`
          : "-",
    },
    {
      key: "equipment",
      header: "Equipment",
      render: (row) => (
        <Badge variant={row.hasOwnEquipment ? "success" : "neutral"}>
          {row.hasOwnEquipment ? "Own" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button
          size="sm"
          onClick={() => setSchedulingSpecialist(row)}
        >
          Schedule
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !examRequest) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load exam request</div>
        <p className={styles.errorDetail}>
          The exam request could not be found or an error occurred.
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/exam-requests">
            <Button variant="outline">Back to exam requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Exam request — ${examRequest.examType.replace(/_/g, " ")}`}
        backLink={{ label: "Back to exam requests", to: "/exam-requests" }}
        actions={
          examRequest.status === "CREATED" ? (
            <div className={styles.headerActions}>
              <Button
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                isLoading={cancelMutation.isPending}
              >
                Cancel request
              </Button>
            </div>
          ) : undefined
        }
      />

      <DetailSection title="Request details" columns={2}>
        <FieldDisplay
          label="Exam type"
          value={examRequest.examType.replace(/_/g, " ")}
        />
        <FieldDisplay
          label="Priority"
          value={
            <Badge
              variant={PRIORITY_VARIANT[examRequest.priority] ?? "neutral"}
            >
              {examRequest.priority}
            </Badge>
          }
        />
        <FieldDisplay
          label="Status"
          value={<StatusBadge status={examRequest.status} />}
        />
        <FieldDisplay
          label="Patient"
          value={
            <Link
              to={`/patients/${examRequest.patientId}`}
              className={styles.tableLink}
            >
              {patient?.name ?? examRequest.patientId.substring(0, 8) + "..."}
            </Link>
          }
        />
        <FieldDisplay
          label="Requested by"
          value={examRequest.requestedBy ?? "-"}
        />
        <FieldDisplay
          label="Created"
          value={new Date(examRequest.createdAt).toLocaleDateString()}
        />
        {examRequest.diagnosticHypothesis && (
          <FieldDisplay
            label="Diagnostic hypothesis"
            value={examRequest.diagnosticHypothesis}
            fullWidth
          />
        )}
        {examRequest.clinicalHistory && (
          <FieldDisplay
            label="Clinical history"
            value={examRequest.clinicalHistory}
            fullWidth
          />
        )}
        {examRequest.additionalNotes && (
          <FieldDisplay
            label="Additional notes"
            value={examRequest.additionalNotes}
            fullWidth
          />
        )}
      </DetailSection>

      {examRequest.status === "PENDING_SPECIALIST" && (
        <div className={styles.section}>
          <Card>
            <div className={styles.pendingInfo}>
              <p className={styles.pendingInfoText}>
                Waiting for specialist acceptance
              </p>
              <p className={styles.pendingInfoDetail}>
                An appointment has been sent to the specialist. If the specialist declines or the appointment is cancelled, you can assign another specialist.
              </p>
            </div>
          </Card>
        </div>
      )}

      {examRequest.status === "CREATED" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Available specialists</h3>
            {!showSpecialists && (
              <Button onClick={() => setShowSpecialists(true)}>
                Find available specialists
              </Button>
            )}
          </div>

          {showSpecialists && (
            <Card noPadding>
              <div className={styles.filterRow}>
                <label className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={filterBySpecialty}
                    onChange={(e) => setFilterBySpecialty(e.target.checked)}
                  />
                  Filter by specialty ({examRequest.examType.replace(/_/g, " ").toLowerCase()})
                </label>
              </div>
              {isLoadingSpecialists && (
                <div className={styles.loadingContainer}>
                  <Spinner size="lg" />
                </div>
              )}

              {isErrorSpecialists && (
                <div className={styles.specialistError}>
                  <p className={styles.specialistErrorText}>
                    Failed to search specialists.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => refetchSpecialists()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {specialists && specialists.length === 0 && (
                <EmptyState
                  title="No specialists available"
                  description={
                    clinic
                      ? `No specialists found covering ${clinic.city} / ${clinic.state} for ${examRequest.examType.replace(/_/g, " ").toLowerCase()}.`
                      : "No specialists found for this region and exam type."
                  }
                />
              )}

              {specialists && specialists.length > 0 && (
                <Table
                  columns={specialistColumns}
                  data={specialists}
                  keyExtractor={(row) => row.id}
                />
              )}
            </Card>
          )}
        </div>
      )}

      {schedulingSpecialist && (
        <Dialog
          open={!!schedulingSpecialist}
          onClose={() => setSchedulingSpecialist(null)}
          title="Schedule appointment"
        >
          <p>
            Schedule an appointment with{" "}
            <strong>{schedulingSpecialist.name}</strong> (CRMV{" "}
            {schedulingSpecialist.crmv} / {schedulingSpecialist.crmvState}) for
            this exam request?
          </p>
          <p className={styles.dialogText}>
            The specialist will receive the request and can accept or decline.
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setSchedulingSpecialist(null)}
            >
              Cancel
            </Button>
            <Button
              isLoading={scheduleMutation.isPending}
              onClick={() =>
                scheduleMutation.mutate(schedulingSpecialist.id)
              }
            >
              Confirm schedule
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

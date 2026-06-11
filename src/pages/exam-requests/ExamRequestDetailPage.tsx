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
        <span style={{ fontWeight: 500 }}>{row.name}</span>
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
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
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/exam-requests" className={styles.backLink}>
            &larr; Back to exam requests
          </Link>
          <h2 className={styles.title}>
            Exam request &mdash; {examRequest.examType.replace(/_/g, " ")}
          </h2>
        </div>
        <div className={styles.headerActions}>
          {examRequest.status === "CREATED" && (
            <Button
              variant="danger"
              onClick={() => cancelMutation.mutate()}
              isLoading={cancelMutation.isPending}
            >
              Cancel request
            </Button>
          )}
        </div>
      </div>

      <Card title="Request details">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Exam type</span>
            <span className={styles.fieldValue}>
              {examRequest.examType.replace(/_/g, " ")}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Priority</span>
            <span className={styles.fieldValue}>
              <Badge
                variant={PRIORITY_VARIANT[examRequest.priority] ?? "neutral"}
              >
                {examRequest.priority}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Status</span>
            <span className={styles.fieldValue}>
              <StatusBadge status={examRequest.status} />
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Patient</span>
            <span className={styles.fieldValue}>
              <Link
                to={`/patients/${examRequest.patientId}`}
                style={{ color: "#1F6F5B", fontWeight: 500 }}
              >
                {patient?.name ?? examRequest.patientId.substring(0, 8) + "..."}
              </Link>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Requested by</span>
            <span className={styles.fieldValue}>
              {examRequest.requestedBy ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Created</span>
            <span className={styles.fieldValue}>
              {new Date(examRequest.createdAt).toLocaleDateString()}
            </span>
          </div>
          {examRequest.diagnosticHypothesis && (
            <div className={styles.fieldFull}>
              <span className={styles.fieldLabel}>Diagnostic hypothesis</span>
              <span className={styles.fieldValue}>
                {examRequest.diagnosticHypothesis}
              </span>
            </div>
          )}
          {examRequest.clinicalHistory && (
            <div className={styles.fieldFull}>
              <span className={styles.fieldLabel}>Clinical history</span>
              <span className={styles.fieldValue}>
                {examRequest.clinicalHistory}
              </span>
            </div>
          )}
          {examRequest.additionalNotes && (
            <div className={styles.fieldFull}>
              <span className={styles.fieldLabel}>Additional notes</span>
              <span className={styles.fieldValue}>
                {examRequest.additionalNotes}
              </span>
            </div>
          )}
        </div>
      </Card>

      {examRequest.status === "PENDING_SPECIALIST" && (
        <div className={styles.section}>
          <Card>
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <p style={{ fontSize: "0.875rem", color: "#4F6257", marginBottom: "0.5rem" }}>
                Waiting for specialist acceptance
              </p>
              <p style={{ fontSize: "0.75rem", color: "#4F6257" }}>
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
              <div className={styles.filterRow} style={{ padding: "1rem 1.5rem 0" }}>
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "3rem",
                  }}
                >
                  <Spinner size="lg" />
                </div>
              )}

              {isErrorSpecialists && (
                <div style={{ padding: "1.5rem", textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#b42318",
                      marginBottom: "0.75rem",
                    }}
                  >
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
          <p
            style={{
              fontSize: "0.875rem",
              color: "#4F6257",
              marginTop: "0.5rem",
            }}
          >
            The specialist will receive the request and can accept or decline.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
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

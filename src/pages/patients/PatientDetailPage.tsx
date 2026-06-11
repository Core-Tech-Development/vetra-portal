import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatient, deletePatient } from "../../api/patients";
import { getTutor } from "../../api/tutors";
import { listExamRequestsByPatient } from "../../api/examRequests";
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  Spinner,
  EmptyState,
  Dialog,
} from "../../components/ui";
import type { BadgeVariant } from "../../components/ui";
import styles from "./PatientDetailPage.module.css";

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
    onError: () => {
      setShowDeleteDialog(false);
    },
  });

  const {
    data: patient,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
  });

  const { data: tutor } = useQuery({
    queryKey: ["tutor", patient?.tutorId],
    queryFn: () => getTutor(patient!.tutorId),
    enabled: !!patient?.tutorId,
  });

  const { data: examRequests } = useQuery({
    queryKey: ["patient-exams", id],
    queryFn: () => listExamRequestsByPatient(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load patient</div>
        <p className={styles.errorDetail}>
          The patient could not be found or an error occurred.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/patients">
            <Button variant="outline">Back to patients</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/patients" className={styles.backLink}>
            &larr; Back to patients
          </Link>
          <h2 className={styles.title}>{patient.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={`/patients/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Card title="Patient information">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Species</span>
            <span className={styles.fieldValue}>
              {patient.species.replace(/_/g, " ")}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Breed</span>
            <span className={styles.fieldValue}>{patient.breed ?? "-"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Sex</span>
            <span className={styles.fieldValue}>{patient.sex ?? "-"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Birth date</span>
            <span className={styles.fieldValue}>
              {patient.birthDate
                ? new Date(patient.birthDate).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Weight (kg)</span>
            <span className={styles.fieldValue}>
              {patient.weightKg != null ? patient.weightKg : "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Neutered</span>
            <span className={styles.fieldValue}>
              {patient.neutered != null ? (patient.neutered ? "Yes" : "No") : "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Microchip</span>
            <span className={styles.fieldValue}>
              {patient.microchip ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Registered</span>
            <span className={styles.fieldValue}>
              {new Date(patient.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {patient.clinicalNotes && (
          <div className={styles.field} style={{ marginTop: "1.5rem" }}>
            <span className={styles.fieldLabel}>Clinical notes</span>
            <span className={styles.fieldValue}>{patient.clinicalNotes}</span>
          </div>
        )}
      </Card>

      <Card title="Tutor" style={{ marginTop: "1.5rem" }}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <span className={styles.fieldValue}>
              {tutor ? (
                <Link
                  to={`/tutors/${tutor.id}`}
                  style={{ color: "#1F6F5B", fontWeight: 500 }}
                >
                  {tutor.name}
                </Link>
              ) : (
                "-"
              )}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>
              {tutor?.phone ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>
              {tutor?.email ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Document</span>
            <span className={styles.fieldValue}>
              {tutor?.document ?? "-"}
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Exam history</h3>
        <Card noPadding>
          {examRequests && examRequests.length === 0 && (
            <EmptyState
              title="No exam requests"
              description="This patient has no exam requests yet."
            />
          )}
          {examRequests && examRequests.length > 0 && (
            <div>
              {examRequests.map((exam) => (
                <Link
                  key={exam.id}
                  to={`/exam-requests/${exam.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className={styles.examItem}>
                    <div className={styles.examInfo}>
                      <span className={styles.examType}>
                        {exam.examType.replace(/_/g, " ")}
                      </span>
                      <span className={styles.examDate}>
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <Badge variant={PRIORITY_VARIANT[exam.priority] ?? "neutral"}>
                        {exam.priority}
                      </Badge>
                      <StatusBadge status={exam.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete patient"
        >
          <p>Are you sure you want to delete patient <strong>{patient.name}</strong>?</p>
          <p style={{ fontSize: "0.875rem", color: "#4F6257", marginTop: "0.5rem" }}>
            This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(id!)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

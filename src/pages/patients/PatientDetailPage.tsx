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
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
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
      <div className={styles.loadingContainer}>
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
        <div className={styles.errorActions}>
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
      <PageHeader
        title={patient.name}
        backLink={{ label: "Back to patients", to: "/patients" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/patients/${id}/edit`}>
              <Button variant="secondary" leftIcon={<Pencil size={16} />}>Edit</Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <DetailSection title="Patient information" columns={3}>
        <FieldDisplay label="Species" value={patient.species.replace(/_/g, " ")} />
        <FieldDisplay label="Breed" value={patient.breed ?? "-"} />
        <FieldDisplay label="Sex" value={patient.sex ?? "-"} />
        <FieldDisplay
          label="Birth date"
          value={
            patient.birthDate
              ? new Date(patient.birthDate).toLocaleDateString()
              : "-"
          }
        />
        <FieldDisplay
          label="Weight (kg)"
          value={patient.weightKg != null ? patient.weightKg : "-"}
        />
        <FieldDisplay
          label="Neutered"
          value={
            patient.neutered != null ? (patient.neutered ? "Yes" : "No") : "-"
          }
        />
        <FieldDisplay label="Microchip" value={patient.microchip ?? "-"} />
        <FieldDisplay
          label="Registered"
          value={new Date(patient.createdAt).toLocaleDateString()}
        />
      </DetailSection>

      {patient.clinicalNotes && (
        <DetailSection columns={2}>
          <FieldDisplay label="Clinical notes" value={patient.clinicalNotes} fullWidth />
        </DetailSection>
      )}

      <DetailSection title="Tutor" columns={3}>
        <FieldDisplay
          label="Name"
          value={
            tutor ? (
              <Link to={`/tutors/${tutor.id}`} className={styles.tableLink}>
                {tutor.name}
              </Link>
            ) : (
              "-"
            )
          }
        />
        <FieldDisplay label="Phone" value={tutor?.phone ?? "-"} />
        <FieldDisplay label="Email" value={tutor?.email ?? "-"} />
        <FieldDisplay label="Document" value={tutor?.document ?? "-"} />
      </DetailSection>

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
                  className={styles.examLink}
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
                    <div className={styles.examBadges}>
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
          <p className={styles.dialogWarning}>
            This action cannot be undone.
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(id!)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

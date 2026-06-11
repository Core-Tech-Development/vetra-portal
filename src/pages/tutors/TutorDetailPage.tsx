import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTutor, deleteTutor } from "../../api/tutors";
import { listPatientsByTutor } from "../../api/patients";
import {
  Button,
  Card,
  Spinner,
  EmptyState,
  Table,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { PatientResponse } from "../../api/types";
import styles from "./TutorDetailPage.module.css";

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (tutorId: string) => deleteTutor(tutorId),
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      navigate("/tutors");
    },
    onError: () => {
      setShowDeleteDialog(false);
    },
  });

  const {
    data: tutor,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => getTutor(id!),
    enabled: !!id,
  });

  const { data: patientsData } = useQuery({
    queryKey: ["tutor-patients", id],
    queryFn: () => listPatientsByTutor(id!, 0, 100),
    enabled: !!id,
  });

  const patientColumns: TableColumn<PatientResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          to={`/patients/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "species",
      header: "Species",
      render: (row) => row.species.replace(/_/g, " "),
    },
    {
      key: "breed",
      header: "Breed",
      render: (row) => row.breed ?? "-",
    },
    {
      key: "sex",
      header: "Sex",
      render: (row) => row.sex ?? "-",
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

  if (isError || !tutor) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load tutor</div>
        <p className={styles.errorDetail}>
          The tutor could not be found or an error occurred.
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
          <Link to="/tutors">
            <Button variant="outline">Back to tutors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/tutors" className={styles.backLink}>
            &larr; Back to tutors
          </Link>
          <h2 className={styles.title}>{tutor.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={`/tutors/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card title="Tutor information">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <span className={styles.fieldValue}>{tutor.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>
              {tutor.phone ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>
              {tutor.email ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Document</span>
            <span className={styles.fieldValue}>
              {tutor.document ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Address</span>
            <span className={styles.fieldValue}>
              {tutor.address ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>City</span>
            <span className={styles.fieldValue}>
              {tutor.city ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>State</span>
            <span className={styles.fieldValue}>
              {tutor.state ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Zip code</span>
            <span className={styles.fieldValue}>
              {tutor.zipCode ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Registered</span>
            <span className={styles.fieldValue}>
              {new Date(tutor.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Patients</h3>
          <Link to="/patients/new">
            <Button size="sm">New patient</Button>
          </Link>
        </div>
        <Card noPadding>
          {patientsData && patientsData.content.length === 0 && (
            <EmptyState
              title="No patients registered"
              description="This tutor has no patients yet."
              action={
                <Link to="/patients/new">
                  <Button>New patient</Button>
                </Link>
              }
            />
          )}
          {patientsData && patientsData.content.length > 0 && (
            <Table
              columns={patientColumns}
              data={patientsData.content}
              keyExtractor={(row) => row.id}
            />
          )}
        </Card>
      </div>

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete tutor"
        >
          <p>
            Are you sure you want to delete tutor{" "}
            <strong>{tutor.name}</strong>?
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#4F6257",
              marginTop: "0.5rem",
            }}
          >
            The tutor must have no linked patients to be deleted.
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
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(id!)}
            >
              Delete
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

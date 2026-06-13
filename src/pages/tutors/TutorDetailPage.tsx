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
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
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
        <Link to={`/patients/${row.id}`} className={styles.tableLink}>
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
      <div className={styles.loadingContainer}>
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
        <div className={styles.errorActions}>
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
      <PageHeader
        title={tutor.name}
        backLink={{ label: "Back to tutors", to: "/tutors" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/tutors/${id}/edit`}>
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

      <DetailSection title="Tutor information" columns={3}>
        <FieldDisplay label="Name" value={tutor.name} />
        <FieldDisplay label="Phone" value={tutor.phone ?? "-"} />
        <FieldDisplay label="Email" value={tutor.email ?? "-"} />
        <FieldDisplay label="Document" value={tutor.document ?? "-"} />
        <FieldDisplay label="Address" value={tutor.address ?? "-"} />
        <FieldDisplay label="City" value={tutor.city ?? "-"} />
        <FieldDisplay label="State" value={tutor.state ?? "-"} />
        <FieldDisplay label="Zip code" value={tutor.zipCode ?? "-"} />
        <FieldDisplay
          label="Registered"
          value={new Date(tutor.createdAt).toLocaleDateString()}
        />
      </DetailSection>

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
          <p className={styles.dialogWarning}>
            The tutor must have no linked patients to be deleted.
          </p>
          <div className={styles.dialogActions}>
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

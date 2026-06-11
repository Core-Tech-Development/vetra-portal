import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPatientsByClinic, deletePatient } from "../../api/patients";
import { useClinicId } from "../../hooks/useClinicId";
import {
  Button,
  Card,
  Table,
  Spinner,
  EmptyState,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { PatientResponse } from "../../api/types";
import styles from "./PatientListPage.module.css";

export function PatientListPage() {
  const [page, setPage] = useState(0);
  const clinicId = useClinicId();

  const queryClient = useQueryClient();
  const [deletingPatient, setDeletingPatient] = useState<any>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["patients", clinicId, page],
    queryFn: () => listPatientsByClinic(clinicId!, page, 20),
    enabled: !!clinicId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      setDeletingPatient(null);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: () => {
      setDeletingPatient(null);
    },
  });

  const columns: TableColumn<PatientResponse>[] = [
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
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Link to={`/patients/${row.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setDeletingPatient(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <div className={styles.header}>
          <h2 className={styles.title}>Patients</h2>
        </div>
        <Card>
          <EmptyState
            title="No clinic selected"
            description="Please select a clinic to view patients."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Patients</h2>
        <Link to="/patients/new">
          <Button>New patient</Button>
        </Link>
      </div>

      <Card noPadding>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Failed to load patients</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the patients list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No patients registered"
            description="Start by registering the first patient for this clinic."
            action={
              <Link to="/patients/new">
                <Button>New patient</Button>
              </Link>
            }
          />
        )}

        {data && data.content.length > 0 && (
          <>
            <Table
              columns={columns}
              data={data.content}
              keyExtractor={(row) => row.id}
            />
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

      {deletingPatient && (
        <Dialog
          open={!!deletingPatient}
          onClose={() => setDeletingPatient(null)}
          title="Delete patient"
        >
          <p>Are you sure you want to delete patient <strong>{deletingPatient.name}</strong>?</p>
          <p style={{ fontSize: "0.875rem", color: "#4F6257", marginTop: "0.5rem" }}>
            This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Button variant="secondary" onClick={() => setDeletingPatient(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingPatient.id)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

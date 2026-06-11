import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTutorsByClinic, deleteTutor } from "../../api/tutors";
import {
  Button,
  Card,
  Table,
  Spinner,
  EmptyState,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { TutorResponse } from "../../api/types";
import styles from "./TutorListPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

export function TutorListPage() {
  const [page, setPage] = useState(0);
  const clinicId = getClinicId();

  const queryClient = useQueryClient();
  const [deletingTutor, setDeletingTutor] = useState<any>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tutors", clinicId, page],
    queryFn: () => listTutorsByClinic(clinicId, page, 20),
    enabled: !!clinicId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTutor(id),
    onSuccess: () => {
      setDeletingTutor(null);
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
    onError: () => {
      setDeletingTutor(null);
    },
  });

  const columns: TableColumn<TutorResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          to={`/tutors/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => row.phone || "--",
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email || "--",
    },
    {
      key: "document",
      header: "Document",
      render: (row) => row.document || "--",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Link to={`/tutors/${row.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setDeletingTutor(row)}>
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
          <h2 className={styles.title}>Tutors</h2>
        </div>
        <Card>
          <div className={styles.noClinic}>
            Please select a clinic first.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Tutors</h2>
        <Link to="/tutors/new">
          <Button>New tutor</Button>
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
            <div className={styles.errorTitle}>Failed to load tutors</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the tutors list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No tutors registered"
            description="Start by registering the first tutor for this clinic."
            action={
              <Link to="/tutors/new">
                <Button>New tutor</Button>
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

      {deletingTutor && (
        <Dialog
          open={!!deletingTutor}
          onClose={() => setDeletingTutor(null)}
          title="Delete tutor"
        >
          <p>Are you sure you want to delete tutor <strong>{deletingTutor.name}</strong>?</p>
          <p style={{ fontSize: "0.875rem", color: "#4F6257", marginTop: "0.5rem" }}>
            The tutor must have no linked patients to be deleted.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Button variant="secondary" onClick={() => setDeletingTutor(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingTutor.id)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

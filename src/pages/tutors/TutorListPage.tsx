import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listTutorsByClinic, deleteTutor } from "../../api/tutors";
import { Button, Dialog } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { TutorResponse } from "../../api/types";
import styles from "./TutorListPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

export function TutorListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
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
        <Link to={`/tutors/${row.id}`} className={styles.tableLink}>
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
        <div className={styles.tableActions}>
          <Link to={`/tutors/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>Edit</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeletingTutor(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title="Tutors" />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: "No clinic selected",
            description: "Please select a clinic first.",
          }}
          page={0}
          totalPages={0}
          onPageChange={() => {}}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tutors"
        actions={
          <Link to="/tutors/new">
            <Button leftIcon={<Plus size={16} />}>New tutor</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load tutors"
        onRetry={() => refetch()}
        emptyState={{
          title: "No tutors registered",
          description: "Start by registering the first tutor for this clinic.",
          action: (
            <Link to="/tutors/new">
              <Button leftIcon={<Plus size={16} />}>New tutor</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tutors..."
      />

      {deletingTutor && (
        <Dialog
          open={!!deletingTutor}
          onClose={() => setDeletingTutor(null)}
          title="Delete tutor"
        >
          <p>Are you sure you want to delete tutor <strong>{deletingTutor.name}</strong>?</p>
          <p className={styles.dialogWarning}>
            The tutor must have no linked patients to be deleted.
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeletingTutor(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingTutor.id)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

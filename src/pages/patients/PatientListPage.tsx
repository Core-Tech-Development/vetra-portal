import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listPatientsByClinic, deletePatient } from "../../api/patients";
import { useClinicId } from "../../hooks/useClinicId";
import { Button, Dialog } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { PatientResponse } from "../../api/types";
import styles from "./PatientListPage.module.css";

export function PatientListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
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
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Link to={`/patients/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>Edit</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeletingPatient(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title="Patients" />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: "No clinic selected",
            description: "Please select a clinic to view patients.",
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
        title="Patients"
        actions={
          <Link to="/patients/new">
            <Button leftIcon={<Plus size={16} />}>New patient</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load patients"
        onRetry={() => refetch()}
        emptyState={{
          title: "No patients registered",
          description: "Start by registering the first patient for this clinic.",
          action: (
            <Link to="/patients/new">
              <Button leftIcon={<Plus size={16} />}>New patient</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patients..."
      />

      {deletingPatient && (
        <Dialog
          open={!!deletingPatient}
          onClose={() => setDeletingPatient(null)}
          title="Delete patient"
        >
          <p>Are you sure you want to delete patient <strong>{deletingPatient.name}</strong>?</p>
          <p className={styles.dialogWarning}>
            This action cannot be undone.
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeletingPatient(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingPatient.id)}>Delete</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

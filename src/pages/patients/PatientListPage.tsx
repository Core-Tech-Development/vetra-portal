import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listPatientsByClinic, deletePatient } from "../../api/patients";
import { useClinicId } from "../../hooks/useClinicId";
import { Button, Dialog } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { PatientResponse } from "../../api/types";
import styles from "./PatientListPage.module.css";

export function PatientListPage() {
  const { t } = useTranslation(['patients', 'common']);
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
      header: t('patients:list.columns.name'),
      render: (row) => (
        <Link to={`/patients/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "species",
      header: t('patients:list.columns.species'),
      render: (row) => t(`common:species.${row.species}`, row.species.replace(/_/g, " ")),
    },
    {
      key: "breed",
      header: t('patients:list.columns.breed'),
      render: (row) => row.breed ?? "-",
    },
    {
      key: "sex",
      header: t('patients:list.columns.sex'),
      render: (row) => row.sex ? t(`common:sex.${row.sex}`, row.sex) : "-",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Link to={`/patients/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>{t('common:actions.edit')}</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeletingPatient(row)}>
            {t('common:actions.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title={t('patients:list.title')} />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: t('patients:list.noClinic.title'),
            description: t('patients:list.noClinic.description'),
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
        title={t('patients:list.title')}
        actions={
          <Link to="/patients/new">
            <Button leftIcon={<Plus size={16} />}>{t('patients:list.newPatient')}</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('patients:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('patients:list.empty.title'),
          description: t('patients:list.empty.description'),
          action: (
            <Link to="/patients/new">
              <Button leftIcon={<Plus size={16} />}>{t('patients:list.newPatient')}</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('patients:list.searchPlaceholder')}
      />

      {deletingPatient && (
        <Dialog
          open={!!deletingPatient}
          onClose={() => setDeletingPatient(null)}
          title={t('patients:list.deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('patients:list.deleteDialog.message', { name: deletingPatient.name }) }} />
          <p className={styles.dialogWarning}>
            {t('patients:list.deleteDialog.warning')}
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeletingPatient(null)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingPatient.id)}>{t('common:actions.delete')}</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

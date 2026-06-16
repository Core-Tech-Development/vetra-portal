import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['tutors', 'common']);
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
      header: t('tutors:list.columns.name'),
      render: (row) => (
        <Link to={`/tutors/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "phone",
      header: t('tutors:list.columns.phone'),
      render: (row) => row.phone || "--",
    },
    {
      key: "email",
      header: t('tutors:list.columns.email'),
      render: (row) => row.email || "--",
    },
    {
      key: "document",
      header: t('tutors:list.columns.document'),
      render: (row) => row.document || "--",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Link to={`/tutors/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>{t('common:actions.edit')}</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeletingTutor(row)}>
            {t('common:actions.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title={t('tutors:list.title')} />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: t('tutors:list.noClinic.title'),
            description: t('tutors:list.noClinic.description'),
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
        title={t('tutors:list.title')}
        actions={
          <Link to="/tutors/new">
            <Button leftIcon={<Plus size={16} />}>{t('tutors:list.newTutor')}</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('tutors:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('tutors:list.empty.title'),
          description: t('tutors:list.empty.description'),
          action: (
            <Link to="/tutors/new">
              <Button leftIcon={<Plus size={16} />}>{t('tutors:list.newTutor')}</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('tutors:list.searchPlaceholder')}
      />

      {deletingTutor && (
        <Dialog
          open={!!deletingTutor}
          onClose={() => setDeletingTutor(null)}
          title={t('tutors:list.deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('tutors:list.deleteDialog.message', { name: deletingTutor.name }) }} />
          <p className={styles.dialogWarning}>
            {t('tutors:list.deleteDialog.warning')}
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeletingTutor(null)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingTutor.id)}>{t('common:actions.delete')}</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

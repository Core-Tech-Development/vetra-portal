import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { ClinicStaffResponse } from "../../api/types";
import styles from "./StaffListPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

function getRoleBadgeVariant(role: string): "neutral" | "info" {
  switch (role) {
    case "VETERINARIAN":
      return "info";
    case "SECRETARY":
      return "neutral";
    default:
      return "neutral";
  }
}

export function StaffListPage() {
  const { t } = useTranslation(['staff', 'common']);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const clinicId = getClinicId();

  const queryClient = useQueryClient();
  const [deactivatingStaff, setDeactivatingStaff] = useState<ClinicStaffResponse | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinic-staff", clinicId, page],
    queryFn: () => listClinicStaff(clinicId, page, 20),
    enabled: !!clinicId,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateClinicStaff(id),
    onSuccess: () => {
      setDeactivatingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
    },
    onError: () => {
      setDeactivatingStaff(null);
    },
  });

  const columns: TableColumn<ClinicStaffResponse>[] = [
    {
      key: "name",
      header: t('staff:list.columns.name'),
      render: (row) => (
        <Link to={`/staff/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: t('staff:list.columns.email'),
      render: (row) => row.email,
    },
    {
      key: "role",
      header: t('staff:list.columns.role'),
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {t(`common:staffRoles.${row.role}`, row.role)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t('staff:list.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Link to={`/staff/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>{t('common:actions.edit')}</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeactivatingStaff(row)}>
            {t('common:actions.deactivate')}
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title={t('staff:list.title')} />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: t('staff:list.noClinic.title'),
            description: t('staff:list.noClinic.description'),
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
        title={t('staff:list.title')}
        actions={
          <Link to="/staff/new">
            <Button leftIcon={<Plus size={16} />}>{t('staff:list.newCollaborator')}</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('staff:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('staff:list.empty.title'),
          description: t('staff:list.empty.description'),
          action: (
            <Link to="/staff/new">
              <Button leftIcon={<Plus size={16} />}>{t('staff:list.newCollaborator')}</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('staff:list.searchPlaceholder')}
      />

      {deactivatingStaff && (
        <Dialog
          open={!!deactivatingStaff}
          onClose={() => setDeactivatingStaff(null)}
          title={t('staff:list.deactivateDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('staff:list.deactivateDialog.message', { name: deactivatingStaff.name }) }} />
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeactivatingStaff(null)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" isLoading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(deactivatingStaff.id)}>{t('common:actions.deactivate')}</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

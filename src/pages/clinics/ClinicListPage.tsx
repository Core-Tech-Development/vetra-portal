import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listClinics } from "../../api/clinics";
import { Button, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { ClinicResponse } from "../../api/types";
import styles from "./ClinicListPage.module.css";

export function ClinicListPage() {
  const { t } = useTranslation('clinics');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinics", page],
    queryFn: () => listClinics(page, 20),
  });

  const columns: TableColumn<ClinicResponse>[] = [
    {
      key: "name",
      header: t('list.columns.name'),
      render: (row) => (
        <Link to={`/clinics/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "document",
      header: t('list.columns.document'),
      render: (row) => row.document,
    },
    {
      key: "city",
      header: t('list.columns.city'),
      render: (row) => `${row.city}, ${row.state}`,
    },
    {
      key: "status",
      header: t('list.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        actions={
          <Link to="/clinics/new">
            <Button leftIcon={<Plus size={16} />}>{t('list.newClinic')}</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('list.empty.title'),
          description: t('list.empty.description'),
          action: (
            <Link to="/clinics/new">
              <Button leftIcon={<Plus size={16} />}>{t('list.newClinic')}</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('list.searchPlaceholder')}
      />
    </div>
  );
}

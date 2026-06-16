import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listSpecialists } from "../../api/specialists";
import { Button, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { SpecialistResponse } from "../../api/types";
import styles from "./SpecialistListPage.module.css";

export function SpecialistListPage() {
  const { t } = useTranslation('specialists');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["specialists", page],
    queryFn: () => listSpecialists(page, 20),
  });

  const columns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: t('list.columns.name'),
      render: (row) => (
        <Link to={`/specialists/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: t('list.columns.email'),
      render: (row) => row.email,
    },
    {
      key: "crmv",
      header: t('list.columns.crmv'),
      render: (row) => `${row.crmv} / ${row.crmvState}`,
    },
    {
      key: "specialty",
      header: t('list.columns.specialty'),
      render: (row) => row.specialty.replace(/_/g, " "),
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
          <Link to="/specialists/new">
            <Button leftIcon={<Plus size={16} />}>{t('list.newSpecialist')}</Button>
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
            <Link to="/specialists/new">
              <Button leftIcon={<Plus size={16} />}>{t('list.newSpecialist')}</Button>
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

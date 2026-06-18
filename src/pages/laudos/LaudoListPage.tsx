import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listLaudosBySpecialist } from "../../api/laudos";
import { Card, StatusBadge, EmptyState } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { LaudoResponse } from "../../api/types";
import { formatDate } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./LaudoListPage.module.css";

export function LaudoListPage() {
  const { t } = useTranslation(['laudos', 'common']);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const specialistId = localStorage.getItem("vetra_specialist_id") || "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["laudos", specialistId, page],
    queryFn: () => listLaudosBySpecialist(specialistId, page, 20),
    enabled: !!specialistId,
    staleTime: STALE_TIMES.list,
  });

  const columns: TableColumn<LaudoResponse>[] = [
    {
      key: "id",
      header: t('laudos:list.columns.id'),
      render: (row) => (
        <Link to={`/laudos/${row.id}`} className={styles.tableLink}>
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "appointmentId",
      header: t('laudos:list.columns.appointment'),
      render: (row) => row.appointmentId.substring(0, 8),
    },
    {
      key: "status",
      header: t('laudos:list.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "issuedAt",
      header: t('laudos:list.columns.issuedDate'),
      render: (row) =>
        row.issuedAt ? formatDate(row.issuedAt) : "-",
    },
    {
      key: "createdAt",
      header: t('laudos:list.columns.created'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  if (!specialistId) {
    return (
      <div>
        <PageHeader title={t('laudos:list.title')} />
        <Card>
          <EmptyState
            title={t('laudos:list.noSpecialist.title')}
            description={t('laudos:list.noSpecialist.description')}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t('laudos:list.title')} />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('laudos:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('laudos:list.empty.title'),
          description: t('laudos:list.empty.description'),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('laudos:list.searchPlaceholder')}
      />
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "../../api/admin";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { AuditLogResponse } from "../../api/types";
import { formatDateTime } from "../../i18n/formatting";

export function AuditLogPage() {
  const { t } = useTranslation('admin');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => listAuditLogs(page, 20),
  });

  const columns: TableColumn<AuditLogResponse>[] = [
    {
      key: "actorUserId",
      header: t('auditLog.columns.actor'),
      render: (row) =>
        row.actorUserId ? row.actorUserId.substring(0, 8) : "-",
    },
    {
      key: "entityType",
      header: t('auditLog.columns.entityType'),
      render: (row) => row.entityType,
    },
    {
      key: "entityId",
      header: t('auditLog.columns.entityId'),
      render: (row) => row.entityId.substring(0, 8),
    },
    {
      key: "action",
      header: t('auditLog.columns.action'),
      render: (row) => row.action,
    },
    {
      key: "createdAt",
      header: t('auditLog.columns.date'),
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader title={t('auditLog.title')} />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('auditLog.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('auditLog.empty.title'),
          description: t('auditLog.empty.description'),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('auditLog.searchPlaceholder')}
      />
    </div>
  );
}

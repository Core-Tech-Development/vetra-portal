import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "../../api/admin";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { AuditLogResponse } from "../../api/types";

export function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => listAuditLogs(page, 20),
  });

  const columns: TableColumn<AuditLogResponse>[] = [
    {
      key: "actorUserId",
      header: "Actor",
      render: (row) =>
        row.actorUserId ? row.actorUserId.substring(0, 8) : "-",
    },
    {
      key: "entityType",
      header: "Entity type",
      render: (row) => row.entityType,
    },
    {
      key: "entityId",
      header: "Entity ID",
      render: (row) => row.entityId.substring(0, 8),
    },
    {
      key: "action",
      header: "Action",
      render: (row) => row.action,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Audit log" />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load audit logs"
        onRetry={() => refetch()}
        emptyState={{
          title: "No audit entries",
          description: "Audit log entries will appear here as actions are performed on the platform.",
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit logs..."
      />
    </div>
  );
}

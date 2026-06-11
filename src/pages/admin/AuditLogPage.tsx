import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "../../api/admin";
import {
  Button,
  Card,
  Table,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { AuditLogResponse } from "../../api/types";
import styles from "./AuditLogPage.module.css";

export function AuditLogPage() {
  const [page, setPage] = useState(0);

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
      <div className={styles.header}>
        <h2 className={styles.title}>Audit log</h2>
      </div>

      <Card noPadding>
        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "3rem",
            }}
          >
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Failed to load audit logs</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the audit log. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No audit entries"
            description="Audit log entries will appear here as actions are performed on the platform."
          />
        )}

        {data && data.content.length > 0 && (
          <>
            <Table
              columns={columns}
              data={data.content}
              keyExtractor={(row) => row.id}
            />
            {data.totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className={styles.pageInfo}>
                  Page {page + 1} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

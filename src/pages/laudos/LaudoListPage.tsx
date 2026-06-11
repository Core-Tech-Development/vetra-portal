import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listLaudosBySpecialist } from "../../api/laudos";
import {
  Button,
  Card,
  Table,
  StatusBadge,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { LaudoResponse } from "../../api/types";
import styles from "./LaudoListPage.module.css";

export function LaudoListPage() {
  const [page, setPage] = useState(0);
  const specialistId = localStorage.getItem("vetra_specialist_id") || "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["laudos", specialistId, page],
    queryFn: () => listLaudosBySpecialist(specialistId, page, 20),
    enabled: !!specialistId,
  });

  const columns: TableColumn<LaudoResponse>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <Link
          to={`/laudos/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "appointmentId",
      header: "Appointment",
      render: (row) => row.appointmentId.substring(0, 8),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "issuedAt",
      header: "Issued date",
      render: (row) =>
        row.issuedAt ? new Date(row.issuedAt).toLocaleDateString() : "-",
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (!specialistId) {
    return (
      <div>
        <div className={styles.header}>
          <h2 className={styles.title}>Laudos</h2>
        </div>
        <Card>
          <div className={styles.noSpecialist}>
            No specialist ID found. Please log in as a specialist to view
            laudos.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Laudos</h2>
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
            <div className={styles.errorTitle}>Failed to load laudos</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the laudos list. Please try
              again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No laudos yet"
            description="Laudos will appear here after you create them from an appointment."
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

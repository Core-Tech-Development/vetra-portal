import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listClinics } from "../../api/clinics";
import {
  Button,
  Card,
  Table,
  StatusBadge,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { ClinicResponse } from "../../api/types";
import styles from "./ClinicListPage.module.css";

export function ClinicListPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinics", page],
    queryFn: () => listClinics(page, 20),
  });

  const columns: TableColumn<ClinicResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          to={`/clinics/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "document",
      header: "Document",
      render: (row) => row.document,
    },
    {
      key: "city",
      header: "City",
      render: (row) => `${row.city}, ${row.state}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Clinics</h2>
        <Link to="/clinics/new">
          <Button>New clinic</Button>
        </Link>
      </div>

      <Card noPadding>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Failed to load clinics</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the clinics list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No clinics registered"
            description="Start by registering the first clinic on the platform."
            action={
              <Link to="/clinics/new">
                <Button>New clinic</Button>
              </Link>
            }
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

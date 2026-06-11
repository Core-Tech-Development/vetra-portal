import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listSpecialists } from "../../api/specialists";
import {
  Button,
  Card,
  Table,
  StatusBadge,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { SpecialistResponse } from "../../api/types";
import styles from "./SpecialistListPage.module.css";

export function SpecialistListPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["specialists", page],
    queryFn: () => listSpecialists(page, 20),
  });

  const columns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          to={`/specialists/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
    {
      key: "crmv",
      header: "CRMV",
      render: (row) => `${row.crmv} / ${row.crmvState}`,
    },
    {
      key: "specialty",
      header: "Specialty",
      render: (row) => row.specialty.replace(/_/g, " "),
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
        <h2 className={styles.title}>Specialists</h2>
        <Link to="/specialists/new">
          <Button>New specialist</Button>
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
            <div className={styles.errorTitle}>Failed to load specialists</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the specialists list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No specialists registered"
            description="Start by registering the first specialist on the platform."
            action={
              <Link to="/specialists/new">
                <Button>New specialist</Button>
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

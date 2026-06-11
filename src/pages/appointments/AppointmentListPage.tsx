import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAppointments } from "../../api/appointments";
import {
  Button,
  Card,
  Select,
  Table,
  StatusBadge,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { AppointmentResponse } from "../../api/types";
import styles from "./AppointmentListPage.module.css";

const APPOINTMENT_STATUSES = [
  { value: "", label: "All" },
  { value: "WAITING_SPECIALIST_ACCEPTANCE", label: "Waiting specialist acceptance" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_TRANSIT", label: "In transit" },
  { value: "IN_SERVICE", label: "In service" },
  { value: "WAITING_REPORT", label: "Waiting report" },
  { value: "REPORT_ISSUED", label: "Report issued" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function AppointmentListPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments", page, statusFilter],
    queryFn: () => listAppointments(page, 20, statusFilter || undefined),
  });

  const columns: TableColumn<AppointmentResponse>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <Link
          to={`/appointments/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "specialist",
      header: "Specialist",
      render: (row) => row.specialistId.substring(0, 8),
    },
    {
      key: "scheduledDate",
      header: "Scheduled Date",
      render: (row) =>
        row.scheduledStartAt
          ? new Date(row.scheduledStartAt).toLocaleDateString()
          : "\u2014",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Appointments</h2>
      </div>

      <div className={styles.filters}>
        <Select
          label="Status"
          selectSize="sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <Card noPadding>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Failed to load appointments</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the appointments list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No appointments found"
            description="There are no appointments matching the current filter."
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

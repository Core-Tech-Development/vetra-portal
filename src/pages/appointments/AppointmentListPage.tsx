import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAppointments } from "../../api/appointments";
import { Select, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
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
  const [search, setSearch] = useState("");
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
        <Link to={`/appointments/${row.id}`} className={styles.tableLink}>
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
      <PageHeader title="Appointments" />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load appointments"
        onRetry={() => refetch()}
        emptyState={{
          title: "No appointments found",
          description: "There are no appointments matching the current filter.",
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search appointments..."
        filters={
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
        }
      />
    </div>
  );
}

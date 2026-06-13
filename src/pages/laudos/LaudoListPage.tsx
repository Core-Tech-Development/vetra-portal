import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listLaudosBySpecialist } from "../../api/laudos";
import { Card, StatusBadge, EmptyState } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { LaudoResponse } from "../../api/types";
import styles from "./LaudoListPage.module.css";

export function LaudoListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
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
        <Link to={`/laudos/${row.id}`} className={styles.tableLink}>
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
        <PageHeader title="Laudos" />
        <Card>
          <EmptyState
            title="No specialist found"
            description="No specialist ID found. Please log in as a specialist to view laudos."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Laudos" />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load laudos"
        onRetry={() => refetch()}
        emptyState={{
          title: "No laudos yet",
          description: "Laudos will appear here after you create them from an appointment.",
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search laudos..."
      />
    </div>
  );
}

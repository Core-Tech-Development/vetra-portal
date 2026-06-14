import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClinicBillingRecords } from "../../api/billing";
import type { BillingRecordResponse } from "../../api/types";
import { StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import { useClinicId } from "../../hooks/useClinicId";

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function ClinicBillingPage() {
  const clinicId = useClinicId();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinic-billing", clinicId, page],
    queryFn: () => listClinicBillingRecords(clinicId!, page, 20),
    enabled: !!clinicId,
  });

  const columns: TableColumn<BillingRecordResponse>[] = [
    {
      key: "examType",
      header: "Exam type",
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "totalCents",
      header: "Amount",
      render: (row) => formatCurrency(row.totalCents),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Billing" />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load billing records"
        onRetry={() => refetch()}
        emptyState={{
          title: "No billing records",
          description: "Billing records will appear here when laudos are issued for your exams.",
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search billing records..."
      />
    </div>
  );
}

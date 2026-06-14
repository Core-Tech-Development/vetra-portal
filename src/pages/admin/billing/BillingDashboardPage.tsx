import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBillingDashboard, listBillingRecords } from "../../../api/billing";
import type { BillingRecordResponse } from "../../../api/types";
import { StatusBadge } from "../../../components/ui";
import type { TableColumn } from "../../../components/ui";
import { PageHeader, StatCard, DataTableLayout } from "../../../components/patterns";
import { DollarSign, TrendingUp, Clock, AlertTriangle, Receipt } from "lucide-react";
import styles from "./BillingDashboardPage.module.css";

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function BillingDashboardPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["billing-dashboard"],
    queryFn: getBillingDashboard,
  });

  const { data: records, isLoading: recordsLoading, isError, refetch } = useQuery({
    queryKey: ["billing-records", page],
    queryFn: () => listBillingRecords(page, 20),
  });

  const columns: TableColumn<BillingRecordResponse>[] = [
    {
      key: "examType",
      header: "Exam type",
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "totalCents",
      header: "Total",
      render: (row) => formatCurrency(row.totalCents),
    },
    {
      key: "platformFeeCents",
      header: "Platform fee",
      render: (row) => formatCurrency(row.platformFeeCents),
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

      <div className={styles.statsGrid}>
        <StatCard
          icon={<DollarSign size={20} />}
          value={dashboard ? formatCurrency(dashboard.totalRevenueCents) : "..."}
          label="Total revenue"
          isLoading={dashLoading}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          value={dashboard ? formatCurrency(dashboard.totalPlatformFeeCents) : "..."}
          label="Platform fees"
          isLoading={dashLoading}
        />
        <StatCard
          icon={<Clock size={20} />}
          value={dashboard?.pendingPayments ?? 0}
          label="Pending payments"
          isLoading={dashLoading}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={dashboard?.overduePayments ?? 0}
          label="Overdue"
          isLoading={dashLoading}
        />
        <StatCard
          icon={<Receipt size={20} />}
          value={dashboard?.totalBillingRecords ?? 0}
          label="Total records"
          isLoading={dashLoading}
        />
      </div>

      <DataTableLayout
        columns={columns}
        data={records?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={recordsLoading}
        isError={isError}
        errorMessage="Failed to load billing records"
        onRetry={() => refetch()}
        emptyState={{
          title: "No billing records",
          description: "Billing records will appear here when laudos are issued.",
        }}
        page={page}
        totalPages={records?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search billing records..."
      />
    </div>
  );
}

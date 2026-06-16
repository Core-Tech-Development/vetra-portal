import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getBillingDashboard, listBillingRecords } from "../../../api/billing";
import type { BillingRecordResponse } from "../../../api/types";
import { StatusBadge } from "../../../components/ui";
import type { TableColumn } from "../../../components/ui";
import { PageHeader, StatCard, DataTableLayout } from "../../../components/patterns";
import { DollarSign, TrendingUp, Clock, AlertTriangle, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "../../../i18n/formatting";
import styles from "./BillingDashboardPage.module.css";

export function BillingDashboardPage() {
  const { t } = useTranslation('billing');
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
      header: t('adminDashboard.columns.examType'),
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "totalCents",
      header: t('adminDashboard.columns.total'),
      render: (row) => formatCurrency(row.totalCents),
    },
    {
      key: "platformFeeCents",
      header: t('adminDashboard.columns.platformFee'),
      render: (row) => formatCurrency(row.platformFeeCents),
    },
    {
      key: "status",
      header: t('adminDashboard.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: t('adminDashboard.columns.date'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader title={t('adminDashboard.title')} />

      <div className={styles.statsGrid}>
        <StatCard
          icon={<DollarSign size={20} />}
          value={dashboard ? formatCurrency(dashboard.totalRevenueCents) : "..."}
          label={t('adminDashboard.totalRevenue')}
          isLoading={dashLoading}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          value={dashboard ? formatCurrency(dashboard.totalPlatformFeeCents) : "..."}
          label={t('adminDashboard.platformFees')}
          isLoading={dashLoading}
        />
        <StatCard
          icon={<Clock size={20} />}
          value={dashboard?.pendingPayments ?? 0}
          label={t('adminDashboard.pendingPayments')}
          isLoading={dashLoading}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={dashboard?.overduePayments ?? 0}
          label={t('adminDashboard.overdue')}
          isLoading={dashLoading}
        />
        <StatCard
          icon={<Receipt size={20} />}
          value={dashboard?.totalBillingRecords ?? 0}
          label={t('adminDashboard.totalRecords')}
          isLoading={dashLoading}
        />
      </div>

      <DataTableLayout
        columns={columns}
        data={records?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={recordsLoading}
        isError={isError}
        errorMessage={t('adminDashboard.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('adminDashboard.empty.title'),
          description: t('adminDashboard.empty.description'),
        }}
        page={page}
        totalPages={records?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('adminDashboard.searchPlaceholder')}
      />
    </div>
  );
}

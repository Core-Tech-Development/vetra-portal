import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { listClinicBillingRecords } from "../../api/billing";
import type { BillingRecordResponse } from "../../api/types";
import { StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import { useClinicId } from "../../hooks/useClinicId";
import { formatCurrency, formatDate } from "../../i18n/formatting";

export function ClinicBillingPage() {
  const { t } = useTranslation('billing');
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
      header: t('clinicBilling.columns.examType'),
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "totalCents",
      header: t('clinicBilling.columns.amount'),
      render: (row) => formatCurrency(row.totalCents),
    },
    {
      key: "status",
      header: t('clinicBilling.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: t('clinicBilling.columns.date'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader title={t('clinicBilling.title')} />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('clinicBilling.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('clinicBilling.empty.title'),
          description: t('clinicBilling.empty.description'),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('clinicBilling.searchPlaceholder')}
      />
    </div>
  );
}

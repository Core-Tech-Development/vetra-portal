import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listAppointments } from "../../api/appointments";
import { Select, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { AppointmentResponse } from "../../api/types";
import { formatDate } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./AppointmentListPage.module.css";

const APPOINTMENT_STATUS_KEYS = [
  "",
  "WAITING_SPECIALIST_ACCEPTANCE",
  "ACCEPTED",
  "IN_TRANSIT",
  "IN_SERVICE",
  "WAITING_REPORT",
  "REPORT_ISSUED",
  "COMPLETED",
  "CANCELLED",
];

export function AppointmentListPage() {
  const { t } = useTranslation(['appointments', 'common']);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments", page, statusFilter],
    queryFn: () => listAppointments(page, 20, statusFilter || undefined),
    staleTime: STALE_TIMES.list,
  });

  const columns: TableColumn<AppointmentResponse>[] = [
    {
      key: "id",
      header: t('appointments:list.columns.id'),
      render: (row) => (
        <Link to={`/appointments/${row.id}`} className={styles.tableLink}>
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "specialist",
      header: t('appointments:list.columns.specialist'),
      render: (row) => row.specialistId.substring(0, 8),
    },
    {
      key: "scheduledDate",
      header: t('appointments:list.columns.scheduledDate'),
      render: (row) =>
        row.scheduledStartAt
          ? formatDate(row.scheduledStartAt)
          : "\u2014",
    },
    {
      key: "status",
      header: t('appointments:list.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: t('appointments:list.columns.created'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader title={t('appointments:list.title')} />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('appointments:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('appointments:list.empty.title'),
          description: t('appointments:list.empty.description'),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('appointments:list.searchPlaceholder')}
        filters={
          <Select
            label={t('common:labels.status')}
            selectSize="sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            {APPOINTMENT_STATUS_KEYS.map((key) => (
              <option key={key} value={key}>
                {key === "" ? t('appointments:list.statusFilter.all') : t(`appointments:list.statusFilter.${key}`, t(`common:status.${key}`, key))}
              </option>
            ))}
          </Select>
        }
      />
    </div>
  );
}

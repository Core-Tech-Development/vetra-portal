import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { listExamRequestsByClinic } from "../../api/examRequests";
import { useClinicId } from "../../hooks/useClinicId";
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { ExamRequestResponse } from "../../api/types";
import { formatDate } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./ExamRequestListPage.module.css";

const PRIORITY_VARIANT: Record<string, "neutral" | "warning" | "danger"> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function ExamRequestListPage() {
  const { t } = useTranslation(['examRequests', 'common']);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const clinicId = useClinicId();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["exam-requests", clinicId, page],
    queryFn: () => listExamRequestsByClinic(clinicId!, page, 20),
    enabled: !!clinicId,
    staleTime: STALE_TIMES.list,
  });

  const columns: TableColumn<ExamRequestResponse>[] = [
    {
      key: "id",
      header: t('examRequests:list.columns.id'),
      render: (row) => (
        <Link to={`/exam-requests/${row.id}`} className={styles.tableLink}>
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "examType",
      header: t('examRequests:list.columns.examType'),
      render: (row) => t(`common:examTypes.${row.examType}`, row.examType.replace(/_/g, " ")),
    },
    {
      key: "priority",
      header: t('examRequests:list.columns.priority'),
      render: (row) => (
        <Badge variant={PRIORITY_VARIANT[row.priority] ?? "neutral"}>
          {t(`common:priority.${row.priority}`, row.priority)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t('examRequests:list.columns.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "appointmentStatus",
      header: t('examRequests:list.columns.appointment'),
      render: (row) =>
        row.appointmentId ? (
          <Link
            to={`/appointments/${row.appointmentId}`}
            className={styles.appointmentLink}
          >
            <StatusBadge status={row.appointmentStatus!} />
          </Link>
        ) : (
          <span className={styles.emptyCell}>{"\u2014"}</span>
        ),
    },
    {
      key: "createdAt",
      header: t('examRequests:list.columns.created'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title={t('examRequests:list.title')} />
        <Card>
          <EmptyState
            title={t('examRequests:list.noClinic.title')}
            description={t('examRequests:list.noClinic.description')}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('examRequests:list.title')}
        actions={
          <Link to="/exam-requests/new">
            <Button leftIcon={<Plus size={16} />}>{t('examRequests:list.newExamRequest')}</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('examRequests:list.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('examRequests:list.empty.title'),
          description: t('examRequests:list.empty.description'),
          action: (
            <Link to="/exam-requests/new">
              <Button leftIcon={<Plus size={16} />}>{t('examRequests:list.newExamRequest')}</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('examRequests:list.searchPlaceholder')}
      />
    </div>
  );
}

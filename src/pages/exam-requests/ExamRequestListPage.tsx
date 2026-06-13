import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import styles from "./ExamRequestListPage.module.css";

const PRIORITY_VARIANT: Record<string, "neutral" | "warning" | "danger"> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function ExamRequestListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const clinicId = useClinicId();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["exam-requests", clinicId, page],
    queryFn: () => listExamRequestsByClinic(clinicId!, page, 20),
    enabled: !!clinicId,
  });

  const columns: TableColumn<ExamRequestResponse>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <Link to={`/exam-requests/${row.id}`} className={styles.tableLink}>
          {row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: "examType",
      header: "Exam type",
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <Badge variant={PRIORITY_VARIANT[row.priority] ?? "neutral"}>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "appointmentStatus",
      header: "Appointment",
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
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title="Exam requests" />
        <Card>
          <EmptyState
            title="No clinic selected"
            description="Please select a clinic to view exam requests."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Exam requests"
        actions={
          <Link to="/exam-requests/new">
            <Button leftIcon={<Plus size={16} />}>New exam request</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load exam requests"
        onRetry={() => refetch()}
        emptyState={{
          title: "No exam requests",
          description: "Start by creating the first exam request for this clinic.",
          action: (
            <Link to="/exam-requests/new">
              <Button leftIcon={<Plus size={16} />}>New exam request</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search exam requests..."
      />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listExamRequestsByClinic } from "../../api/examRequests";
import { useClinicId } from "../../hooks/useClinicId";
import {
  Button,
  Card,
  Table,
  Badge,
  StatusBadge,
  Spinner,
  EmptyState,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { ExamRequestResponse } from "../../api/types";
import styles from "./ExamRequestListPage.module.css";

const PRIORITY_VARIANT: Record<string, "neutral" | "warning" | "danger"> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function ExamRequestListPage() {
  const [page, setPage] = useState(0);
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
        <Link
          to={`/exam-requests/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
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
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <StatusBadge status={row.appointmentStatus!} />
          </Link>
        ) : (
          <span style={{ color: "#4F6257", fontSize: "0.8125rem" }}>{"\u2014"}</span>
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
        <div className={styles.header}>
          <h2 className={styles.title}>Exam requests</h2>
        </div>
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
      <div className={styles.header}>
        <h2 className={styles.title}>Exam requests</h2>
        <Link to="/exam-requests/new">
          <Button>New exam request</Button>
        </Link>
      </div>

      <Card noPadding>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>Failed to load exam requests</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching exam requests. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No exam requests"
            description="Start by creating the first exam request for this clinic."
            action={
              <Link to="/exam-requests/new">
                <Button>New exam request</Button>
              </Link>
            }
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

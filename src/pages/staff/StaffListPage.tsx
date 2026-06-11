import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Card,
  Table,
  Spinner,
  EmptyState,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import type { ClinicStaffResponse } from "../../api/types";
import styles from "./StaffListPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "VETERINARIAN":
      return "Veterinarian";
    case "SECRETARY":
      return "Secretary";
    default:
      return role.replace(/_/g, " ").toLowerCase();
  }
}

function getRoleBadgeVariant(role: string): "neutral" | "info" {
  switch (role) {
    case "VETERINARIAN":
      return "info";
    case "SECRETARY":
      return "neutral";
    default:
      return "neutral";
  }
}

export function StaffListPage() {
  const [page, setPage] = useState(0);
  const clinicId = getClinicId();

  const queryClient = useQueryClient();
  const [deactivatingStaff, setDeactivatingStaff] = useState<ClinicStaffResponse | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinic-staff", clinicId, page],
    queryFn: () => listClinicStaff(clinicId, page, 20),
    enabled: !!clinicId,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateClinicStaff(id),
    onSuccess: () => {
      setDeactivatingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
    },
    onError: () => {
      setDeactivatingStaff(null);
    },
  });

  const columns: TableColumn<ClinicStaffResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          to={`/staff/${row.id}`}
          style={{ color: "#1F6F5B", fontWeight: 500 }}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {getRoleLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Link to={`/staff/${row.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setDeactivatingStaff(row)}>
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <div className={styles.header}>
          <h2 className={styles.title}>Staff</h2>
        </div>
        <Card>
          <div className={styles.noClinic}>
            Please select a clinic first.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Staff</h2>
        <Link to="/staff/new">
          <Button>New collaborator</Button>
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
            <div className={styles.errorTitle}>Failed to load staff</div>
            <p className={styles.errorDetail}>
              An error occurred while fetching the staff list. Please try again.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <EmptyState
            title="No staff registered"
            description="Start by registering the first collaborator for this clinic."
            action={
              <Link to="/staff/new">
                <Button>New collaborator</Button>
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

      {deactivatingStaff && (
        <Dialog
          open={!!deactivatingStaff}
          onClose={() => setDeactivatingStaff(null)}
          title="Deactivate collaborator"
        >
          <p>
            Are you sure you want to deactivate <strong>{deactivatingStaff.name}</strong>?
            They will no longer be able to access the platform.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Button variant="secondary" onClick={() => setDeactivatingStaff(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(deactivatingStaff.id)}>Deactivate</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

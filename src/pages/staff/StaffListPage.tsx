import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
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
  const [search, setSearch] = useState("");
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
        <Link to={`/staff/${row.id}`} className={styles.tableLink}>
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
        <div className={styles.tableActions}>
          <Link to={`/staff/${row.id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>Edit</Button>
          </Link>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeactivatingStaff(row)}>
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  if (!clinicId) {
    return (
      <div>
        <PageHeader title="Staff" />
        <DataTableLayout
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={false}
          emptyState={{
            title: "No clinic selected",
            description: "Please select a clinic first.",
          }}
          page={0}
          totalPages={0}
          onPageChange={() => {}}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        actions={
          <Link to="/staff/new">
            <Button leftIcon={<Plus size={16} />}>New collaborator</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load staff"
        onRetry={() => refetch()}
        emptyState={{
          title: "No staff registered",
          description: "Start by registering the first collaborator for this clinic.",
          action: (
            <Link to="/staff/new">
              <Button leftIcon={<Plus size={16} />}>New collaborator</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff..."
      />

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
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDeactivatingStaff(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(deactivatingStaff.id)}>Deactivate</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

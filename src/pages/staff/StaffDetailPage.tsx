import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Card,
  Spinner,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import styles from "./StaffDetailPage.module.css";

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

export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const deactivateMutation = useMutation({
    mutationFn: (staffId: string) => deactivateClinicStaff(staffId),
    onSuccess: () => {
      setShowDeactivateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
      navigate("/staff");
    },
    onError: () => {
      setShowDeactivateDialog(false);
    },
  });

  const {
    data: staff,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["clinic-staff-detail", id],
    queryFn: () => getClinicStaff(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load collaborator</div>
        <p className={styles.errorDetail}>
          The collaborator could not be found or an error occurred.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/staff">
            <Button variant="outline">Back to staff</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/staff" className={styles.backLink}>
            &larr; Back to staff
          </Link>
          <h2 className={styles.title}>{staff.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={`/staff/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeactivateDialog(true)}
          >
            Deactivate
          </Button>
        </div>
      </div>

      <Card title="Collaborator information">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <span className={styles.fieldValue}>{staff.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{staff.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>
              {staff.phone ?? "-"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Role</span>
            <span className={styles.fieldValue}>
              <Badge variant={getRoleBadgeVariant(staff.role)}>
                {getRoleLabel(staff.role)}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Status</span>
            <span className={styles.fieldValue}>
              <StatusBadge status={staff.status} />
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Registered</span>
            <span className={styles.fieldValue}>
              {new Date(staff.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {showDeactivateDialog && (
        <Dialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          title="Deactivate collaborator"
        >
          <p>
            Are you sure you want to deactivate{" "}
            <strong>{staff.name}</strong>?
            They will no longer be able to access the platform.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowDeactivateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate(id!)}
            >
              Deactivate
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

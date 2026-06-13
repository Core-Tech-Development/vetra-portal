import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Spinner,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
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
      <div className={styles.loadingContainer}>
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
        <div className={styles.errorActions}>
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
      <PageHeader
        title={staff.name}
        backLink={{ label: "Back to staff", to: "/staff" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/staff/${id}/edit`}>
              <Button variant="secondary" leftIcon={<Pencil size={16} />}>Edit</Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeactivateDialog(true)}
            >
              Deactivate
            </Button>
          </div>
        }
      />

      <DetailSection title="Collaborator information" columns={3}>
        <FieldDisplay label="Name" value={staff.name} />
        <FieldDisplay label="Email" value={staff.email} />
        <FieldDisplay label="Phone" value={staff.phone ?? "-"} />
        <FieldDisplay
          label="Role"
          value={
            <Badge variant={getRoleBadgeVariant(staff.role)}>
              {getRoleLabel(staff.role)}
            </Badge>
          }
        />
        <FieldDisplay
          label="Status"
          value={<StatusBadge status={staff.status} />}
        />
        <FieldDisplay
          label="Registered"
          value={new Date(staff.createdAt).toLocaleDateString()}
        />
      </DetailSection>

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
          <div className={styles.dialogActions}>
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

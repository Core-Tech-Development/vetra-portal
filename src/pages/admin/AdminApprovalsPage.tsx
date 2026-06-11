import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listClinics } from "../../api/clinics";
import { listSpecialists, approveSpecialist } from "../../api/specialists";
import { approveClinic } from "../../api/admin";
import { Button, Card, Spinner } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import styles from "./AdminApprovalsPage.module.css";

export function AdminApprovalsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ["clinics", 0],
    queryFn: () => listClinics(0, 100),
  });

  const { data: specialistsData, isLoading: specialistsLoading } = useQuery({
    queryKey: ["specialists", 0],
    queryFn: () => listSpecialists(0, 100),
  });

  const pendingClinics =
    clinicsData?.content.filter((c) => c.status === "PENDING_APPROVAL") ?? [];
  const pendingSpecialists =
    specialistsData?.content.filter((s) => s.status === "PENDING_APPROVAL") ??
    [];

  const approveCMutation = useMutation({
    mutationFn: (id: string) => approveClinic(id),
    onSuccess: () => {
      showToast("Clinic approved.", "success");
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast("Failed to approve clinic.", "error");
    },
  });

  const approveSMutation = useMutation({
    mutationFn: (id: string) => approveSpecialist(id),
    onSuccess: () => {
      showToast("Specialist approved.", "success");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast("Failed to approve specialist.", "error");
    },
  });

  const isLoading = clinicsLoading || specialistsLoading;

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

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Pending approvals</h2>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending clinics</h3>
        <Card noPadding>
          {pendingClinics.length === 0 ? (
            <div className={styles.emptySection}>
              No clinics pending approval.
            </div>
          ) : (
            pendingClinics.map((clinic) => (
              <div key={clinic.id} className={styles.approvalItem}>
                <div className={styles.approvalInfo}>
                  <span className={styles.approvalName}>{clinic.name}</span>
                  <span className={styles.approvalDetail}>
                    {clinic.document} &middot; {clinic.city}, {clinic.state}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => approveCMutation.mutate(clinic.id)}
                  isLoading={
                    approveCMutation.isPending &&
                    approveCMutation.variables === clinic.id
                  }
                  disabled={approveCMutation.isPending}
                >
                  Approve
                </Button>
              </div>
            ))
          )}
        </Card>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending specialists</h3>
        <Card noPadding>
          {pendingSpecialists.length === 0 ? (
            <div className={styles.emptySection}>
              No specialists pending approval.
            </div>
          ) : (
            pendingSpecialists.map((specialist) => (
              <div key={specialist.id} className={styles.approvalItem}>
                <div className={styles.approvalInfo}>
                  <span className={styles.approvalName}>
                    {specialist.name}
                  </span>
                  <span className={styles.approvalDetail}>
                    {specialist.crmv}/{specialist.crmvState} &middot;{" "}
                    {specialist.specialty}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => approveSMutation.mutate(specialist.id)}
                  isLoading={
                    approveSMutation.isPending &&
                    approveSMutation.variables === specialist.id
                  }
                  disabled={approveSMutation.isPending}
                >
                  Approve
                </Button>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLaudo, issueLaudo } from "../../api/laudos";
import { Button, Card, StatusBadge, Spinner } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import styles from "./LaudoDetailPage.module.css";

export function LaudoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: laudo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["laudo", id],
    queryFn: () => getLaudo(id!),
    enabled: !!id,
  });

  const issueMutation = useMutation({
    mutationFn: () => issueLaudo(id!),
    onSuccess: () => {
      showToast("Laudo issued successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["laudo", id] });
    },
    onError: () => {
      showToast("Failed to issue laudo.", "error");
    },
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !laudo) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load laudo</div>
        <p className={styles.errorDetail}>
          The laudo could not be found or an error occurred.
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/laudos">
            <Button variant="outline">Back to laudos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Laudo ${laudo.id.substring(0, 8)}`}
        backLink={{ label: "Back to laudos", to: "/laudos" }}
        actions={
          <StatusBadge status={laudo.status} />
        }
      />

      <DetailSection title="Laudo information" columns={2}>
        <FieldDisplay label="Laudo ID" value={laudo.id} />
        <FieldDisplay label="Appointment ID" value={laudo.appointmentId} />
        <FieldDisplay label="Specialist ID" value={laudo.specialistId} />
        <FieldDisplay label="Status" value={laudo.status} />
        <FieldDisplay
          label="Issued date"
          value={
            laudo.issuedAt
              ? new Date(laudo.issuedAt).toLocaleString()
              : "-"
          }
        />
        <FieldDisplay
          label="Created"
          value={new Date(laudo.createdAt).toLocaleString()}
        />
      </DetailSection>

      {laudo.findings && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>Findings</div>
            <div className={styles.contentText}>{laudo.findings}</div>
          </Card>
        </div>
      )}

      {laudo.conclusion && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>Conclusion</div>
            <div className={styles.contentText}>{laudo.conclusion}</div>
          </Card>
        </div>
      )}

      {laudo.recommendations && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>Recommendations</div>
            <div className={styles.contentText}>{laudo.recommendations}</div>
          </Card>
        </div>
      )}

      {laudo.status === "DRAFT" && (
        <div className={styles.actionRow}>
          <Button
            onClick={() => issueMutation.mutate()}
            isLoading={issueMutation.isPending}
          >
            Issue laudo
          </Button>
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLaudo, issueLaudo } from "../../api/laudos";
import { Button, Card, StatusBadge, Spinner } from "../../components/ui";
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

  if (isError || !laudo) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load laudo</div>
        <p className={styles.errorDetail}>
          The laudo could not be found or an error occurred.
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
          <Link to="/laudos">
            <Button variant="outline">Back to laudos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/laudos" className={styles.backLink}>
            &larr; Back to laudos
          </Link>
          <h2 className={styles.title}>Laudo {laudo.id.substring(0, 8)}</h2>
          <StatusBadge status={laudo.status} />
        </div>
      </div>

      <Card title="Laudo information">
        <div className={styles.infoGrid}>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Laudo ID</span>
            <span className={styles.fieldValue}>{laudo.id}</span>
          </div>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Appointment ID</span>
            <span className={styles.fieldValue}>{laudo.appointmentId}</span>
          </div>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Specialist ID</span>
            <span className={styles.fieldValue}>{laudo.specialistId}</span>
          </div>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Status</span>
            <span className={styles.fieldValue}>{laudo.status}</span>
          </div>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Issued date</span>
            <span className={styles.fieldValue}>
              {laudo.issuedAt
                ? new Date(laudo.issuedAt).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Created</span>
            <span className={styles.fieldValue}>
              {new Date(laudo.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {laudo.findings && (
        <div className={styles.contentSection}>
          <Card>
            <div className={styles.contentLabel}>Findings</div>
            <div className={styles.contentText}>{laudo.findings}</div>
          </Card>
        </div>
      )}

      {laudo.conclusion && (
        <div className={styles.contentSection}>
          <Card>
            <div className={styles.contentLabel}>Conclusion</div>
            <div className={styles.contentText}>{laudo.conclusion}</div>
          </Card>
        </div>
      )}

      {laudo.recommendations && (
        <div className={styles.contentSection}>
          <Card>
            <div className={styles.contentLabel}>Recommendations</div>
            <div className={styles.contentText}>{laudo.recommendations}</div>
          </Card>
        </div>
      )}

      {laudo.status === "DRAFT" && (
        <div className={styles.actions}>
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

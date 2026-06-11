import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClinic } from "../../api/clinics";
import { Button, Card, StatusBadge, Spinner } from "../../components/ui";
import styles from "./ClinicDetailPage.module.css";

export function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: clinic, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinic", id],
    queryFn: () => getClinic(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load clinic</div>
        <p className={styles.errorDetail}>
          The clinic could not be found or an error occurred.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/clinics">
            <Button variant="outline">Back to clinics</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{clinic.name}</h2>
          <StatusBadge status={clinic.status} />
        </div>
        <Link to="/clinics">
          <Button variant="secondary">Back to clinics</Button>
        </Link>
      </div>

      <Card title="Clinic information">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Document (CNPJ)</span>
            <span className={styles.fieldValue}>{clinic.document}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{clinic.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>{clinic.phone}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Location</span>
            <span className={styles.fieldValue}>
              {clinic.city}, {clinic.state}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Address</span>
            <span className={styles.fieldValue}>{clinic.address}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Registered</span>
            <span className={styles.fieldValue}>
              {new Date(clinic.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

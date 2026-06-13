import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClinic } from "../../api/clinics";
import { Button, StatusBadge, Spinner } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ArrowLeft } from "lucide-react";
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
      <div className={styles.loadingContainer}>
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
        <div className={styles.errorActions}>
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
      <PageHeader
        title={clinic.name}
        subtitle={clinic.status}
        backLink={{ label: "Back to clinics", to: "/clinics" }}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge status={clinic.status} />
            <Link to="/clinics">
              <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
                Back to clinics
              </Button>
            </Link>
          </div>
        }
      />

      <DetailSection title="Clinic information" columns={3}>
        <FieldDisplay label="Document (CNPJ)" value={clinic.document} />
        <FieldDisplay label="Email" value={clinic.email} />
        <FieldDisplay label="Phone" value={clinic.phone} />
        <FieldDisplay label="Location" value={`${clinic.city}, ${clinic.state}`} />
        <FieldDisplay label="Address" value={clinic.address} />
        <FieldDisplay
          label="Registered"
          value={new Date(clinic.createdAt).toLocaleDateString()}
        />
      </DetailSection>
    </div>
  );
}

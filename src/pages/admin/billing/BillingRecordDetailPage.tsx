import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBillingRecord } from "../../../api/billing";
import { Button, StatusBadge, Card, Spinner } from "../../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../../components/patterns";
import { ArrowLeft } from "lucide-react";
import styles from "./BillingRecordDetailPage.module.css";

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function BillingRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["billing-record", id],
    queryFn: () => getBillingRecord(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <PageHeader title="Billing record" />
        <Card>
          <p>Failed to load billing record.</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Billing record"
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div className={styles.content}>
        <Card>
          <DetailSection title="Financial details">
            <div className={styles.fieldsGrid}>
              <FieldDisplay label="Total" value={formatCurrency(data.totalCents)} />
              <FieldDisplay
                label="Platform fee"
                value={formatCurrency(data.platformFeeCents)}
              />
              <FieldDisplay
                label="Specialist share"
                value={formatCurrency(data.specialistShareCents)}
              />
              <FieldDisplay
                label="Status"
                value={<StatusBadge status={data.status} />}
              />
            </div>
          </DetailSection>
        </Card>

        <Card>
          <DetailSection title="References">
            <div className={styles.fieldsGrid}>
              <FieldDisplay label="Exam type" value={data.examType.replace(/_/g, " ")} />
              <FieldDisplay label="Laudo ID" value={data.laudoId.substring(0, 8)} />
              <FieldDisplay
                label="Appointment ID"
                value={data.appointmentId.substring(0, 8)}
              />
              <FieldDisplay label="Clinic ID" value={data.clinicId.substring(0, 8)} />
              <FieldDisplay
                label="Specialist ID"
                value={data.specialistId.substring(0, 8)}
              />
              {data.asaasPaymentId && (
                <FieldDisplay label="Asaas Payment" value={data.asaasPaymentId} />
              )}
            </div>
          </DetailSection>
        </Card>

        {data.errorMessage && (
          <Card>
            <DetailSection title="Error">
              <p className={styles.errorMessage}>{data.errorMessage}</p>
            </DetailSection>
          </Card>
        )}

        <Card>
          <DetailSection title="Timestamps">
            <div className={styles.fieldsGrid}>
              <FieldDisplay
                label="Created"
                value={new Date(data.createdAt).toLocaleString()}
              />
              <FieldDisplay
                label="Updated"
                value={new Date(data.updatedAt).toLocaleString()}
              />
            </div>
          </DetailSection>
        </Card>
      </div>
    </div>
  );
}

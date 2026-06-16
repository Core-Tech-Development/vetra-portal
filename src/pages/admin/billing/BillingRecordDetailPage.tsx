import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBillingRecord } from "../../../api/billing";
import { Button, StatusBadge, Card, Spinner } from "../../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../../components/patterns";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../../i18n/formatting";
import styles from "./BillingRecordDetailPage.module.css";

export function BillingRecordDetailPage() {
  const { t } = useTranslation(['billing', 'common']);
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
        <PageHeader title={t('billing:recordDetail.title')} />
        <Card>
          <p>{t('billing:recordDetail.errorLoading')}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('common:actions.goBack')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('billing:recordDetail.title')}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            {t('common:actions.back')}
          </Button>
        }
      />

      <div className={styles.content}>
        <Card>
          <DetailSection title={t('billing:recordDetail.sections.financialDetails')}>
            <div className={styles.fieldsGrid}>
              <FieldDisplay label={t('billing:recordDetail.fields.total')} value={formatCurrency(data.totalCents)} />
              <FieldDisplay
                label={t('billing:recordDetail.fields.platformFee')}
                value={formatCurrency(data.platformFeeCents)}
              />
              <FieldDisplay
                label={t('billing:recordDetail.fields.specialistShare')}
                value={formatCurrency(data.specialistShareCents)}
              />
              <FieldDisplay
                label={t('billing:recordDetail.fields.status')}
                value={<StatusBadge status={data.status} />}
              />
            </div>
          </DetailSection>
        </Card>

        <Card>
          <DetailSection title={t('billing:recordDetail.sections.references')}>
            <div className={styles.fieldsGrid}>
              <FieldDisplay label={t('billing:recordDetail.fields.examType')} value={data.examType.replace(/_/g, " ")} />
              <FieldDisplay label={t('billing:recordDetail.fields.laudoId')} value={data.laudoId.substring(0, 8)} />
              <FieldDisplay
                label={t('billing:recordDetail.fields.appointmentId')}
                value={data.appointmentId.substring(0, 8)}
              />
              <FieldDisplay label={t('billing:recordDetail.fields.clinicId')} value={data.clinicId.substring(0, 8)} />
              <FieldDisplay
                label={t('billing:recordDetail.fields.specialistId')}
                value={data.specialistId.substring(0, 8)}
              />
              {data.asaasPaymentId && (
                <FieldDisplay label={t('billing:recordDetail.fields.asaasPayment')} value={data.asaasPaymentId} />
              )}
            </div>
          </DetailSection>
        </Card>

        {data.errorMessage && (
          <Card>
            <DetailSection title={t('billing:recordDetail.sections.error')}>
              <p className={styles.errorMessage}>{data.errorMessage}</p>
            </DetailSection>
          </Card>
        )}

        <Card>
          <DetailSection title={t('billing:recordDetail.sections.timestamps')}>
            <div className={styles.fieldsGrid}>
              <FieldDisplay
                label={t('billing:recordDetail.fields.created')}
                value={formatDateTime(data.createdAt)}
              />
              <FieldDisplay
                label={t('billing:recordDetail.fields.updated')}
                value={formatDateTime(data.updatedAt)}
              />
            </div>
          </DetailSection>
        </Card>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClinic } from "../../api/clinics";
import { Button, StatusBadge, Spinner } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "../../i18n/formatting";
import styles from "./ClinicDetailPage.module.css";

export function ClinicDetailPage() {
  const { t } = useTranslation(['clinics', 'common']);
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
        <div className={styles.errorTitle}>{t('clinics:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('clinics:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/clinics">
            <Button variant="outline">{t('clinics:detail.error.backButton')}</Button>
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
        backLink={{ label: t('clinics:detail.backLink'), to: "/clinics" }}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge status={clinic.status} />
            <Link to="/clinics">
              <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
                {t('clinics:detail.backLink')}
              </Button>
            </Link>
          </div>
        }
      />

      <DetailSection title={t('clinics:detail.sections.clinicInformation')} columns={3}>
        <FieldDisplay label={t('clinics:detail.fields.documentCnpj')} value={clinic.document} />
        <FieldDisplay label={t('clinics:detail.fields.email')} value={clinic.email} />
        <FieldDisplay label={t('clinics:detail.fields.phone')} value={clinic.phone} />
        <FieldDisplay label={t('clinics:detail.fields.location')} value={`${clinic.city}, ${clinic.state}`} />
        <FieldDisplay label={t('clinics:detail.fields.address')} value={clinic.address} />
        <FieldDisplay
          label={t('clinics:detail.fields.registered')}
          value={formatDate(clinic.createdAt)}
        />
      </DetailSection>
    </div>
  );
}

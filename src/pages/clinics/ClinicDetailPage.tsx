import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClinic } from "../../api/clinics";
import { deleteClinic } from "../../api/admin";
import { Button, StatusBadge, Spinner, Dialog } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../i18n/formatting";
import styles from "./ClinicDetailPage.module.css";

export function ClinicDetailPage() {
  const { t } = useTranslation(['clinics', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { roles } = useAuth();
  const isAdmin = roles.includes("PLATFORM_ADMIN");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: clinic, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinic", id],
    queryFn: () => getClinic(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClinic(id!),
    onSuccess: () => {
      showToast(t('clinics:deleteDialog.success'), 'success');
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      navigate("/clinics");
    },
    onError: () => {
      showToast(t('clinics:deleteDialog.error'), 'error');
      setShowDeleteDialog(false);
    },
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
            {isAdmin && (
              <Button
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={() => setShowDeleteDialog(true)}
              >
                {t('common:actions.delete')}
              </Button>
            )}
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

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('clinics:deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('clinics:deleteDialog.message', { name: clinic.name }) }} />
          <p className={styles.dialogWarning}>
            {t('clinics:deleteDialog.warning')}
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {t('common:actions.delete')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBillingRecord } from "../../../api/billing";
import { deleteBillingRecord } from "../../../api/admin";
import { Button, StatusBadge, Card, Spinner, Dialog } from "../../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../../components/patterns";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../auth/useAuth";
import { formatCurrency, formatDateTime } from "../../../i18n/formatting";
import styles from "./BillingRecordDetailPage.module.css";

export function BillingRecordDetailPage() {
  const { t } = useTranslation(['billing', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { roles } = useAuth();
  const isAdmin = roles.includes("PLATFORM_ADMIN");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["billing-record", id],
    queryFn: () => getBillingRecord(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBillingRecord(id!),
    onSuccess: () => {
      showToast(t('billing:deleteDialog.success'), 'success');
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      navigate("/admin/billing");
    },
    onError: () => {
      showToast(t('billing:deleteDialog.error'), 'error');
      setShowDeleteDialog(false);
    },
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
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              {t('common:actions.back')}
            </Button>
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

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('billing:deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('billing:deleteDialog.message', { id: data.id.substring(0, 8) }) }} />
          <p className={styles.dialogWarning}>
            {t('billing:deleteDialog.warning')}
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

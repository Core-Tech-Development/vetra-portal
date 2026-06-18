import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { getLaudo, issueLaudo, deleteLaudo } from "../../api/laudos";
import { Button, Card, StatusBadge, Spinner, Dialog } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./LaudoDetailPage.module.css";

export function LaudoDetailPage() {
  const { t } = useTranslation(['laudos', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { roles } = useAuth();
  const isAdmin = roles.includes("PLATFORM_ADMIN");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: laudo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["laudo", id],
    queryFn: () => getLaudo(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.profile,
  });

  const issueMutation = useMutation({
    mutationFn: () => issueLaudo(id!),
    onSuccess: () => {
      showToast(t('laudos:detail.toast.issued'), "success");
      queryClient.invalidateQueries({ queryKey: ["laudo", id] });
    },
    onError: () => {
      showToast(t('laudos:detail.toast.issueFailed'), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteLaudo(id!),
    onSuccess: () => {
      showToast(t('laudos:deleteDialog.success'), 'success');
      queryClient.invalidateQueries({ queryKey: ["laudos"] });
      navigate("/laudos");
    },
    onError: () => {
      showToast(t('laudos:deleteDialog.error'), 'error');
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

  if (isError || !laudo) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('laudos:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('laudos:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/laudos">
            <Button variant="outline">{t('laudos:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${t('laudos:detail.titlePrefix')} ${laudo.id.substring(0, 8)}`}
        backLink={{ label: t('laudos:detail.backLink'), to: "/laudos" }}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge status={laudo.status} />
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

      <DetailSection title={t('laudos:detail.sections.laudoInformation')} columns={2}>
        <FieldDisplay label={t('laudos:detail.fields.laudoId')} value={laudo.id} />
        <FieldDisplay label={t('laudos:detail.fields.appointmentId')} value={laudo.appointmentId} />
        <FieldDisplay label={t('laudos:detail.fields.specialistId')} value={laudo.specialistId} />
        <FieldDisplay label={t('laudos:detail.fields.status')} value={laudo.status} />
        <FieldDisplay
          label={t('laudos:detail.fields.issuedDate')}
          value={
            laudo.issuedAt
              ? formatDateTime(laudo.issuedAt)
              : "-"
          }
        />
        <FieldDisplay
          label={t('laudos:detail.fields.created')}
          value={formatDateTime(laudo.createdAt)}
        />
      </DetailSection>

      {laudo.findings && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>{t('laudos:detail.fields.findings')}</div>
            <div className={styles.contentText}>{laudo.findings}</div>
          </Card>
        </div>
      )}

      {laudo.conclusion && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>{t('laudos:detail.fields.conclusion')}</div>
            <div className={styles.contentText}>{laudo.conclusion}</div>
          </Card>
        </div>
      )}

      {laudo.recommendations && (
        <div className={styles.section}>
          <Card>
            <div className={styles.contentLabel}>{t('laudos:detail.fields.recommendations')}</div>
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
            {t('laudos:detail.issueLaudo')}
          </Button>
        </div>
      )}

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('laudos:deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('laudos:deleteDialog.message', { id: laudo.id.substring(0, 8) }) }} />
          <p className={styles.dialogWarning}>
            {t('laudos:deleteDialog.warning')}
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

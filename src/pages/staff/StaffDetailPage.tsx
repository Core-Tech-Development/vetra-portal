import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getClinicStaff, deactivateClinicStaff } from "../../api/clinicStaff";
import {
  Button,
  Spinner,
  Badge,
  StatusBadge,
  Dialog,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../i18n/formatting";
import styles from "./StaffDetailPage.module.css";

function getRoleBadgeVariant(role: string): "neutral" | "info" {
  switch (role) {
    case "VETERINARIAN":
      return "info";
    case "SECRETARY":
      return "neutral";
    default:
      return "neutral";
  }
}

export function StaffDetailPage() {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const deactivateMutation = useMutation({
    mutationFn: (staffId: string) => deactivateClinicStaff(staffId),
    onSuccess: () => {
      setShowDeactivateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
      navigate("/staff");
    },
    onError: () => {
      setShowDeactivateDialog(false);
    },
  });

  const {
    data: staff,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["clinic-staff-detail", id],
    queryFn: () => getClinicStaff(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('staff:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('staff:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/staff">
            <Button variant="outline">{t('staff:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={staff.name}
        backLink={{ label: t('staff:detail.backLink'), to: "/staff" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/staff/${id}/edit`}>
              <Button variant="secondary" leftIcon={<Pencil size={16} />}>{t('common:actions.edit')}</Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeactivateDialog(true)}
            >
              {t('common:actions.deactivate')}
            </Button>
          </div>
        }
      />

      <DetailSection title={t('staff:detail.sections.collaboratorInformation')} columns={3}>
        <FieldDisplay label={t('staff:detail.fields.name')} value={staff.name} />
        <FieldDisplay label={t('staff:detail.fields.email')} value={staff.email} />
        <FieldDisplay label={t('staff:detail.fields.phone')} value={staff.phone ?? "-"} />
        <FieldDisplay
          label={t('staff:detail.fields.role')}
          value={
            <Badge variant={getRoleBadgeVariant(staff.role)}>
              {t(`common:staffRoles.${staff.role}`, staff.role)}
            </Badge>
          }
        />
        <FieldDisplay
          label={t('staff:detail.fields.status')}
          value={<StatusBadge status={staff.status} />}
        />
        <FieldDisplay
          label={t('staff:detail.fields.registered')}
          value={formatDate(staff.createdAt)}
        />
      </DetailSection>

      {showDeactivateDialog && (
        <Dialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          title={t('staff:list.deactivateDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('staff:list.deactivateDialog.message', { name: staff.name }) }} />
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setShowDeactivateDialog(false)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate(id!)}
            >
              {t('common:actions.deactivate')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

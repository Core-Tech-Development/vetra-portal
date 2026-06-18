import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getPatient, deletePatient } from "../../api/patients";
import { getTutor } from "../../api/tutors";
import { listExamRequestsByPatient } from "../../api/examRequests";
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  Spinner,
  EmptyState,
  Dialog,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
import type { BadgeVariant } from "../../components/ui";
import { formatDate } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./PatientDetailPage.module.css";

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function PatientDetailPage() {
  const { t } = useTranslation(['patients', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
    onError: () => {
      setShowDeleteDialog(false);
    },
  });

  const {
    data: patient,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.profile,
  });

  const { data: tutor } = useQuery({
    queryKey: ["tutor", patient?.tutorId],
    queryFn: () => getTutor(patient!.tutorId),
    enabled: !!patient?.tutorId,
    staleTime: STALE_TIMES.profile,
  });

  const { data: examRequests } = useQuery({
    queryKey: ["patient-exams", id],
    queryFn: () => listExamRequestsByPatient(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.list,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('patients:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('patients:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/patients">
            <Button variant="outline">{t('patients:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={patient.name}
        backLink={{ label: t('patients:detail.backLink'), to: "/patients" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/patients/${id}/edit`}>
              <Button variant="secondary" leftIcon={<Pencil size={16} />}>{t('common:actions.edit')}</Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeleteDialog(true)}
            >
              {t('common:actions.delete')}
            </Button>
          </div>
        }
      />

      <DetailSection title={t('patients:detail.sections.patientInformation')} columns={3}>
        <FieldDisplay label={t('patients:detail.fields.species')} value={t(`common:species.${patient.species}`, patient.species.replace(/_/g, " "))} />
        <FieldDisplay label={t('patients:detail.fields.breed')} value={patient.breed ?? "-"} />
        <FieldDisplay label={t('patients:detail.fields.sex')} value={patient.sex ? t(`common:sex.${patient.sex}`, patient.sex) : "-"} />
        <FieldDisplay
          label={t('patients:detail.fields.birthDate')}
          value={
            patient.birthDate
              ? formatDate(patient.birthDate)
              : "-"
          }
        />
        <FieldDisplay
          label={t('patients:detail.fields.weightKg')}
          value={patient.weightKg != null ? patient.weightKg : "-"}
        />
        <FieldDisplay
          label={t('patients:detail.fields.neutered')}
          value={
            patient.neutered != null ? (patient.neutered ? t('common:common.yes') : t('common:common.no')) : "-"
          }
        />
        <FieldDisplay label={t('patients:detail.fields.microchip')} value={patient.microchip ?? "-"} />
        <FieldDisplay
          label={t('patients:detail.fields.registered')}
          value={formatDate(patient.createdAt)}
        />
      </DetailSection>

      {patient.clinicalNotes && (
        <DetailSection columns={2}>
          <FieldDisplay label={t('patients:detail.fields.clinicalNotes')} value={patient.clinicalNotes} fullWidth />
        </DetailSection>
      )}

      <DetailSection title={t('patients:detail.sections.tutor')} columns={3}>
        <FieldDisplay
          label={t('patients:detail.fields.name')}
          value={
            tutor ? (
              <Link to={`/tutors/${tutor.id}`} className={styles.tableLink}>
                {tutor.name}
              </Link>
            ) : (
              "-"
            )
          }
        />
        <FieldDisplay label={t('patients:detail.fields.phone')} value={tutor?.phone ?? "-"} />
        <FieldDisplay label={t('patients:detail.fields.email')} value={tutor?.email ?? "-"} />
        <FieldDisplay label={t('patients:detail.fields.document')} value={tutor?.document ?? "-"} />
      </DetailSection>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('patients:detail.sections.examHistory')}</h3>
        <Card noPadding>
          {examRequests && examRequests.length === 0 && (
            <EmptyState
              title={t('patients:detail.examEmpty.title')}
              description={t('patients:detail.examEmpty.description')}
            />
          )}
          {examRequests && examRequests.length > 0 && (
            <div>
              {examRequests.map((exam) => (
                <Link
                  key={exam.id}
                  to={`/exam-requests/${exam.id}`}
                  className={styles.examLink}
                >
                  <div className={styles.examItem}>
                    <div className={styles.examInfo}>
                      <span className={styles.examType}>
                        {t(`common:examTypes.${exam.examType}`, exam.examType.replace(/_/g, " "))}
                      </span>
                      <span className={styles.examDate}>
                        {formatDate(exam.createdAt)}
                      </span>
                    </div>
                    <div className={styles.examBadges}>
                      <Badge variant={PRIORITY_VARIANT[exam.priority] ?? "neutral"}>
                        {t(`common:priority.${exam.priority}`, exam.priority)}
                      </Badge>
                      <StatusBadge status={exam.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('patients:list.deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('patients:list.deleteDialog.message', { name: patient.name }) }} />
          <p className={styles.dialogWarning}>
            {t('patients:list.deleteDialog.warning')}
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(id!)}>{t('common:actions.delete')}</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

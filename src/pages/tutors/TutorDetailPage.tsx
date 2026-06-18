import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTutor, deleteTutor } from "../../api/tutors";
import { listPatientsByTutor } from "../../api/patients";
import {
  Button,
  Card,
  Spinner,
  EmptyState,
  Table,
  Dialog,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { Pencil, Trash2 } from "lucide-react";
import type { TableColumn } from "../../components/ui";
import type { PatientResponse } from "../../api/types";
import { formatDate } from "../../i18n/formatting";
import { STALE_TIMES } from "../../config/queryConfig";
import styles from "./TutorDetailPage.module.css";

export function TutorDetailPage() {
  const { t } = useTranslation(['tutors', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (tutorId: string) => deleteTutor(tutorId),
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      navigate("/tutors");
    },
    onError: () => {
      setShowDeleteDialog(false);
    },
  });

  const {
    data: tutor,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => getTutor(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.profile,
  });

  const { data: patientsData } = useQuery({
    queryKey: ["tutor-patients", id],
    queryFn: () => listPatientsByTutor(id!, 0, 100),
    enabled: !!id,
    staleTime: STALE_TIMES.list,
  });

  const patientColumns: TableColumn<PatientResponse>[] = [
    {
      key: "name",
      header: t('tutors:detail.patientColumns.name'),
      render: (row) => (
        <Link to={`/patients/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "species",
      header: t('tutors:detail.patientColumns.species'),
      render: (row) => t(`common:species.${row.species}`, row.species.replace(/_/g, " ")),
    },
    {
      key: "breed",
      header: t('tutors:detail.patientColumns.breed'),
      render: (row) => row.breed ?? "-",
    },
    {
      key: "sex",
      header: t('tutors:detail.patientColumns.sex'),
      render: (row) => row.sex ? t(`common:sex.${row.sex}`, row.sex) : "-",
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !tutor) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('tutors:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('tutors:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/tutors">
            <Button variant="outline">{t('tutors:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={tutor.name}
        backLink={{ label: t('tutors:detail.backLink'), to: "/tutors" }}
        actions={
          <div className={styles.headerActions}>
            <Link to={`/tutors/${id}/edit`}>
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

      <DetailSection title={t('tutors:detail.sections.tutorInformation')} columns={3}>
        <FieldDisplay label={t('tutors:detail.fields.name')} value={tutor.name} />
        <FieldDisplay label={t('tutors:detail.fields.phone')} value={tutor.phone ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.email')} value={tutor.email ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.document')} value={tutor.document ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.address')} value={tutor.address ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.city')} value={tutor.city ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.state')} value={tutor.state ?? "-"} />
        <FieldDisplay label={t('tutors:detail.fields.zipCode')} value={tutor.zipCode ?? "-"} />
        <FieldDisplay
          label={t('tutors:detail.fields.registered')}
          value={formatDate(tutor.createdAt)}
        />
      </DetailSection>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('tutors:detail.sections.patients')}</h3>
          <Link to="/patients/new">
            <Button size="sm">{t('tutors:detail.newPatient')}</Button>
          </Link>
        </div>
        <Card noPadding>
          {patientsData && patientsData.content.length === 0 && (
            <EmptyState
              title={t('tutors:detail.patientsEmpty.title')}
              description={t('tutors:detail.patientsEmpty.description')}
              action={
                <Link to="/patients/new">
                  <Button>{t('tutors:detail.newPatient')}</Button>
                </Link>
              }
            />
          )}
          {patientsData && patientsData.content.length > 0 && (
            <Table
              columns={patientColumns}
              data={patientsData.content}
              keyExtractor={(row) => row.id}
            />
          )}
        </Card>
      </div>

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('tutors:list.deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('tutors:list.deleteDialog.message', { name: tutor.name }) }} />
          <p className={styles.dialogWarning}>
            {t('tutors:list.deleteDialog.warning')}
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
              onClick={() => deleteMutation.mutate(id!)}
            >
              {t('common:actions.delete')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getExamRequest, cancelExamRequest } from "../../api/examRequests";
import { getClinic } from "../../api/clinics";
import { getPatient } from "../../api/patients";
import { searchSpecialists } from "../../api/specialists";
import { createAppointment } from "../../api/appointments";
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  Spinner,
  Table,
  EmptyState,
  Dialog,
} from "../../components/ui";
import type { BadgeVariant, TableColumn } from "../../components/ui";
import type { SpecialistResponse } from "../../api/types";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import { formatDate } from "../../i18n/formatting";
import styles from "./ExamRequestDetailPage.module.css";

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  ROUTINE: "neutral",
  PRIORITY: "warning",
  URGENT: "danger",
};

export function ExamRequestDetailPage() {
  const { t } = useTranslation(['examRequests', 'common']);
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [filterBySpecialty, setFilterBySpecialty] = useState(true);
  const [schedulingSpecialist, setSchedulingSpecialist] =
    useState<SpecialistResponse | null>(null);

  const {
    data: examRequest,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["exam-request", id],
    queryFn: () => getExamRequest(id!),
    enabled: !!id,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", examRequest?.patientId],
    queryFn: () => getPatient(examRequest!.patientId),
    enabled: !!examRequest?.patientId,
  });

  const { data: clinic } = useQuery({
    queryKey: ["clinic", examRequest?.clinicId],
    queryFn: () => getClinic(examRequest!.clinicId),
    enabled: !!examRequest?.clinicId,
  });

  const specialtyParam = filterBySpecialty ? examRequest?.examType : undefined;

  const {
    data: specialists,
    isLoading: isLoadingSpecialists,
    isError: isErrorSpecialists,
    refetch: refetchSpecialists,
  } = useQuery({
    queryKey: [
      "available-specialists",
      clinic?.city,
      clinic?.state,
      specialtyParam,
    ],
    queryFn: () =>
      searchSpecialists(clinic!.city, clinic!.state, specialtyParam),
    enabled: showSpecialists && !!clinic && !!examRequest,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelExamRequest(id!),
    onSuccess: () => {
      showToast(t('examRequests:detail.cancelSuccess'), "success");
      queryClient.invalidateQueries({ queryKey: ["exam-request", id] });
    },
    onError: () => {
      showToast(t('examRequests:detail.cancelError'), "error");
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (specialistId: string) =>
      createAppointment({ examRequestId: id!, specialistId }),
    onSuccess: () => {
      setSchedulingSpecialist(null);
      showToast(t('examRequests:detail.scheduleDialog.success'), "success");
      queryClient.invalidateQueries({ queryKey: ["exam-request", id] });
    },
    onError: () => {
      setSchedulingSpecialist(null);
      showToast(t('examRequests:detail.scheduleDialog.error'), "error");
    },
  });

  const specialistColumns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: t('examRequests:detail.specialists.columns.name'),
      render: (row) => (
        <span className={styles.specialistName}>{row.name}</span>
      ),
    },
    {
      key: "crmv",
      header: t('examRequests:detail.specialists.columns.crmv'),
      render: (row) => `${row.crmv} / ${row.crmvState}`,
    },
    {
      key: "specialty",
      header: t('examRequests:detail.specialists.columns.specialty'),
      render: (row) => row.specialty.replace(/_/g, " "),
    },
    {
      key: "baseCity",
      header: t('examRequests:detail.specialists.columns.baseCity'),
      render: (row) =>
        row.baseCity && row.baseState
          ? `${row.baseCity} / ${row.baseState}`
          : "-",
    },
    {
      key: "equipment",
      header: t('examRequests:detail.specialists.columns.equipment'),
      render: (row) => (
        <Badge variant={row.hasOwnEquipment ? "success" : "neutral"}>
          {row.hasOwnEquipment ? t('examRequests:detail.specialists.equipmentOwn') : t('examRequests:detail.specialists.equipmentNo')}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button
          size="sm"
          onClick={() => setSchedulingSpecialist(row)}
        >
          {t('examRequests:detail.specialists.scheduleButton')}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !examRequest) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('examRequests:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('examRequests:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/exam-requests">
            <Button variant="outline">{t('examRequests:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${t('examRequests:detail.titlePrefix')} — ${t(`common:examTypes.${examRequest.examType}`, examRequest.examType.replace(/_/g, " "))}`}
        backLink={{ label: t('examRequests:detail.backLink'), to: "/exam-requests" }}
        actions={
          examRequest.status === "CREATED" ? (
            <div className={styles.headerActions}>
              <Button
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                isLoading={cancelMutation.isPending}
              >
                {t('examRequests:detail.cancelRequest')}
              </Button>
            </div>
          ) : undefined
        }
      />

      <DetailSection title={t('examRequests:detail.sections.requestDetails')} columns={2}>
        <FieldDisplay
          label={t('examRequests:detail.fields.examType')}
          value={t(`common:examTypes.${examRequest.examType}`, examRequest.examType.replace(/_/g, " "))}
        />
        <FieldDisplay
          label={t('examRequests:detail.fields.priority')}
          value={
            <Badge
              variant={PRIORITY_VARIANT[examRequest.priority] ?? "neutral"}
            >
              {t(`common:priority.${examRequest.priority}`, examRequest.priority)}
            </Badge>
          }
        />
        <FieldDisplay
          label={t('examRequests:detail.fields.status')}
          value={<StatusBadge status={examRequest.status} />}
        />
        <FieldDisplay
          label={t('examRequests:detail.fields.patient')}
          value={
            <Link
              to={`/patients/${examRequest.patientId}`}
              className={styles.tableLink}
            >
              {patient?.name ?? examRequest.patientId.substring(0, 8) + "..."}
            </Link>
          }
        />
        <FieldDisplay
          label={t('examRequests:detail.fields.requestedBy')}
          value={examRequest.requestedBy ?? "-"}
        />
        <FieldDisplay
          label={t('examRequests:detail.fields.created')}
          value={formatDate(examRequest.createdAt)}
        />
        {examRequest.diagnosticHypothesis && (
          <FieldDisplay
            label={t('examRequests:detail.fields.diagnosticHypothesis')}
            value={examRequest.diagnosticHypothesis}
            fullWidth
          />
        )}
        {examRequest.clinicalHistory && (
          <FieldDisplay
            label={t('examRequests:detail.fields.clinicalHistory')}
            value={examRequest.clinicalHistory}
            fullWidth
          />
        )}
        {examRequest.additionalNotes && (
          <FieldDisplay
            label={t('examRequests:detail.fields.additionalNotes')}
            value={examRequest.additionalNotes}
            fullWidth
          />
        )}
      </DetailSection>

      {examRequest.status === "PENDING_SPECIALIST" && (
        <div className={styles.section}>
          <Card>
            <div className={styles.pendingInfo}>
              <p className={styles.pendingInfoText}>
                {t('examRequests:detail.pending.title')}
              </p>
              <p className={styles.pendingInfoDetail}>
                {t('examRequests:detail.pending.description')}
              </p>
            </div>
          </Card>
        </div>
      )}

      {examRequest.status === "CREATED" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>{t('examRequests:detail.sections.availableSpecialists')}</h3>
            {!showSpecialists && (
              <Button onClick={() => setShowSpecialists(true)}>
                {t('examRequests:detail.specialists.findButton')}
              </Button>
            )}
          </div>

          {showSpecialists && (
            <Card noPadding>
              <div className={styles.filterRow}>
                <label className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={filterBySpecialty}
                    onChange={(e) => setFilterBySpecialty(e.target.checked)}
                  />
                  {t('examRequests:detail.specialists.filterBySpecialty', { specialty: examRequest.examType.replace(/_/g, " ").toLowerCase() })}
                </label>
              </div>
              {isLoadingSpecialists && (
                <div className={styles.loadingContainer}>
                  <Spinner size="lg" />
                </div>
              )}

              {isErrorSpecialists && (
                <div className={styles.specialistError}>
                  <p className={styles.specialistErrorText}>
                    {t('examRequests:detail.specialists.searchError')}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => refetchSpecialists()}
                  >
                    {t('common:actions.retry')}
                  </Button>
                </div>
              )}

              {specialists && specialists.length === 0 && (
                <EmptyState
                  title={t('examRequests:detail.specialists.empty.title')}
                  description={
                    clinic
                      ? t('examRequests:detail.specialists.empty.descriptionWithLocation', {
                          city: clinic.city,
                          state: clinic.state,
                          examType: t(`common:examTypes.${examRequest.examType}`, examRequest.examType.replace(/_/g, " ").toLowerCase()),
                        })
                      : t('examRequests:detail.specialists.empty.descriptionGeneric')
                  }
                />
              )}

              {specialists && specialists.length > 0 && (
                <Table
                  columns={specialistColumns}
                  data={specialists}
                  keyExtractor={(row) => row.id}
                />
              )}
            </Card>
          )}
        </div>
      )}

      {schedulingSpecialist && (
        <Dialog
          open={!!schedulingSpecialist}
          onClose={() => setSchedulingSpecialist(null)}
          title={t('examRequests:detail.scheduleDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('examRequests:detail.scheduleDialog.message', {
            name: schedulingSpecialist.name,
            crmv: schedulingSpecialist.crmv,
            crmvState: schedulingSpecialist.crmvState,
          }) }} />
          <p className={styles.dialogText}>
            {t('examRequests:detail.scheduleDialog.detail')}
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setSchedulingSpecialist(null)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              isLoading={scheduleMutation.isPending}
              onClick={() =>
                scheduleMutation.mutate(schedulingSpecialist.id)
              }
            >
              {t('examRequests:detail.scheduleDialog.confirmButton')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

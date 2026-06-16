import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getAppointment,
  acceptAppointment,
  declineAppointment,
  startTransit,
  startService,
  completeExam,
  completeAppointment,
  cancelAppointment,
} from "../../api/appointments";
import { listFiles, uploadFile } from "../../api/examFiles";
import { getLaudoByAppointment } from "../../api/laudos";
import { listNotes, createNote } from "../../api/appointmentNotes";
import { Button, Card, StatusBadge, Spinner, Dialog, EmptyState } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { useToast } from "../../components/ui/Toast";
import { useState, useRef } from "react";
import { formatDate, formatDateTime } from "../../i18n/formatting";
import styles from "./AppointmentDetailPage.module.css";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AppointmentDetailPage() {
  const { t } = useTranslation(['appointments', 'common']);
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [viewingNote, setViewingNote] = useState<{
    title: string;
    content: string;
    authorUserId: string;
    createdAt: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: appointment,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointment(id!),
    enabled: !!id,
  });

  const { data: files } = useQuery({
    queryKey: ["appointment-files", id],
    queryFn: () => listFiles(id!),
    enabled: !!id,
  });

  const { data: laudo } = useQuery({
    queryKey: ["appointment-laudo", id],
    queryFn: () => getLaudoByAppointment(id!),
    enabled: !!id,
  });

  const { data: notes } = useQuery({
    queryKey: ["appointment-notes", id],
    queryFn: () => listNotes(id!),
    enabled: !!id,
  });

  const createNoteMutation = useMutation({
    mutationFn: () => createNote(id!, noteTitle, noteContent),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.noteCreated'), "success");
      setNoteTitle("");
      setNoteContent("");
      setShowCreateNoteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["appointment-notes", id] });
    },
    onError: () => showToast(t('appointments:detail.toast.noteCreateFailed'), "error"),
  });

  const invalidateAppointment = () => {
    queryClient.invalidateQueries({ queryKey: ["appointment", id] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptAppointment(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.accepted'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.acceptFailed'), "error"),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineAppointment(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.declined'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.declineFailed'), "error"),
  });

  const transitMutation = useMutation({
    mutationFn: () => startTransit(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.transitStarted'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.transitFailed'), "error"),
  });

  const serviceMutation = useMutation({
    mutationFn: () => startService(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.serviceStarted'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.serviceFailed'), "error"),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeExam(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.examCompleted'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.examCompleteFailed'), "error"),
  });

  const completeAppointmentMutation = useMutation({
    mutationFn: () => completeAppointment(id!),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.appointmentCompleted'), "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.appointmentCompleteFailed'), "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(id!, cancelReason),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.cancelled'), "success");
      setShowCancelDialog(false);
      setCancelReason("");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast(t('appointments:detail.toast.cancelFailed'), "error"),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(id!, file),
    onSuccess: () => {
      showToast(t('appointments:detail.toast.fileUploaded'), "success");
      queryClient.invalidateQueries({ queryKey: ["appointment-files", id] });
    },
    onError: () => showToast(t('appointments:detail.toast.fileUploadFailed'), "error"),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    Array.from(selectedFiles).forEach((file) => {
      uploadMutation.mutate(file);
    });

    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('appointments:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('appointments:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/appointments">
            <Button variant="outline">{t('appointments:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${t('appointments:detail.titlePrefix')} ${appointment.id.substring(0, 8)}`}
        subtitle={appointment.status}
        backLink={{ label: t('appointments:detail.backLink'), to: "/appointments" }}
        actions={
          <StatusBadge status={appointment.status} />
        }
      />

      {/* Appointment Information */}
      <DetailSection title={t('appointments:detail.sections.appointmentInformation')} columns={2}>
        <FieldDisplay label={t('appointments:detail.fields.appointmentId')} value={appointment.id} />
        <FieldDisplay label={t('appointments:detail.fields.examRequestId')} value={appointment.examRequestId} />
        <FieldDisplay label={t('appointments:detail.fields.specialistId')} value={appointment.specialistId} />
        <FieldDisplay
          label={t('appointments:detail.fields.availabilitySlotId')}
          value={appointment.availabilitySlotId ?? "\u2014"}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.scheduledStart')}
          value={appointment.scheduledStartAt ? formatDateTime(appointment.scheduledStartAt) : "\u2014"}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.scheduledEnd')}
          value={appointment.scheduledEndAt ? formatDateTime(appointment.scheduledEndAt) : "\u2014"}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.actualStart')}
          value={appointment.actualStartAt ? formatDateTime(appointment.actualStartAt) : "\u2014"}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.actualEnd')}
          value={appointment.actualEndAt ? formatDateTime(appointment.actualEndAt) : "\u2014"}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.notes')}
          value={appointment.notes ?? "\u2014"}
        />
        {appointment.cancelReason && (
          <FieldDisplay
            label={t('appointments:detail.fields.cancelReason')}
            value={appointment.cancelReason}
          />
        )}
        <FieldDisplay
          label={t('appointments:detail.fields.created')}
          value={formatDate(appointment.createdAt)}
        />
        <FieldDisplay
          label={t('appointments:detail.fields.updated')}
          value={formatDate(appointment.updatedAt)}
        />
      </DetailSection>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        {appointment.status === "WAITING_SPECIALIST_ACCEPTANCE" && (
          <>
            <Button
              onClick={() => acceptMutation.mutate()}
              isLoading={acceptMutation.isPending}
            >
              {t('appointments:detail.actions.accept')}
            </Button>
            <Button
              variant="danger"
              onClick={() => declineMutation.mutate()}
              isLoading={declineMutation.isPending}
            >
              {t('appointments:detail.actions.decline')}
            </Button>
          </>
        )}
        {appointment.status === "ACCEPTED" && (
          <Button
            onClick={() => transitMutation.mutate()}
            isLoading={transitMutation.isPending}
          >
            {t('appointments:detail.actions.startTransit')}
          </Button>
        )}
        {appointment.status === "IN_TRANSIT" && (
          <Button
            onClick={() => serviceMutation.mutate()}
            isLoading={serviceMutation.isPending}
          >
            {t('appointments:detail.actions.startService')}
          </Button>
        )}
        {appointment.status === "IN_SERVICE" && (
          <Button
            onClick={() => completeMutation.mutate()}
            isLoading={completeMutation.isPending}
          >
            {t('appointments:detail.actions.completeExam')}
          </Button>
        )}
        {appointment.status === "WAITING_REPORT" && (
          <Link to={`/laudos/new/${id}`}>
            <Button>{t('appointments:detail.actions.createLaudo')}</Button>
          </Link>
        )}
        {appointment.status === "REPORT_ISSUED" && (
          <Button
            onClick={() => completeAppointmentMutation.mutate()}
            isLoading={completeAppointmentMutation.isPending}
          >
            {t('appointments:detail.actions.completeAppointment')}
          </Button>
        )}
        {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status) && (
          <Button variant="danger" onClick={() => setShowCancelDialog(true)}>
            {t('common:actions.cancel')}
          </Button>
        )}
      </div>

      {/* Files Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('appointments:detail.sections.examFiles')}</h3>
          {appointment.status === "WAITING_REPORT" && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileSelect}
                className={styles.hiddenInput}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadMutation.isPending}
              >
                {t('appointments:detail.actions.uploadFiles')}
              </Button>
            </>
          )}
        </div>
        <Card noPadding>
          {files && files.length > 0 ? (
            files.map((file) => (
              <div key={file.id} className={styles.fileItem}>
                <div>
                  <div className={styles.fileName}>{file.fileName}</div>
                  <div className={styles.fileSize}>
                    {formatFileSize(file.sizeBytes)} &middot; {file.contentType}
                  </div>
                </div>
                <StatusBadge status={file.fileType} />
              </div>
            ))
          ) : (
            <EmptyState
              title={t('appointments:detail.files.empty.title')}
              description={t('appointments:detail.files.empty.description')}
            />
          )}
        </Card>
      </div>

      {/* Laudo Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('appointments:detail.sections.laudo')}</h3>
        {laudo ? (
          <DetailSection columns={2}>
            <FieldDisplay
              label={t('appointments:detail.laudo.fields.status')}
              value={<StatusBadge status={laudo.status} />}
            />
            <FieldDisplay
              label={t('appointments:detail.laudo.fields.issuedAt')}
              value={laudo.issuedAt ? formatDateTime(laudo.issuedAt) : "\u2014"}
            />
            {laudo.findings && (
              <FieldDisplay
                label={t('appointments:detail.laudo.fields.findings')}
                value={laudo.findings}
                fullWidth
              />
            )}
            {laudo.conclusion && (
              <FieldDisplay
                label={t('appointments:detail.laudo.fields.conclusion')}
                value={laudo.conclusion}
                fullWidth
              />
            )}
            <div>
              <Link to={`/laudos/${laudo.id}`}>
                <Button variant="secondary" size="sm">
                  {t('appointments:detail.actions.viewFullLaudo')}
                </Button>
              </Link>
            </div>
          </DetailSection>
        ) : (
          <Card>
            <EmptyState
              title={t('appointments:detail.laudo.empty.title')}
              description={t('appointments:detail.laudo.empty.description')}
            />
          </Card>
        )}
      </div>

      {/* Notes Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('appointments:detail.sections.notes')}</h3>
          {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status) && (
            <Button
              size="sm"
              onClick={() => setShowCreateNoteDialog(true)}
            >
              {t('appointments:detail.actions.createNote')}
            </Button>
          )}
        </div>
        <Card noPadding>
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className={styles.noteItem}
                onClick={() =>
                  setViewingNote({
                    title: note.title,
                    content: note.content,
                    authorUserId: note.authorUserId,
                    createdAt: note.createdAt,
                  })
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setViewingNote({
                      title: note.title,
                      content: note.content,
                      authorUserId: note.authorUserId,
                      createdAt: note.createdAt,
                    });
                  }
                }}
              >
                <div className={styles.noteTitle}>{note.title}</div>
                <div className={styles.noteMeta}>
                  {note.authorUserId} &middot;{" "}
                  {formatDateTime(note.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title={t('appointments:detail.notesSection.empty.title')}
              description={t('appointments:detail.notesSection.empty.description')}
            />
          )}
        </Card>
      </div>

      {/* Create Note Dialog */}
      <Dialog
        open={showCreateNoteDialog}
        onClose={() => {
          setShowCreateNoteDialog(false);
          setNoteTitle("");
          setNoteContent("");
        }}
        title={t('appointments:detail.createNoteDialog.title')}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateNoteDialog(false);
                setNoteTitle("");
                setNoteContent("");
              }}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={() => createNoteMutation.mutate()}
              isLoading={createNoteMutation.isPending}
              disabled={!noteTitle.trim() || !noteContent.trim()}
            >
              {t('common:actions.save')}
            </Button>
          </>
        }
      >
        <div className={styles.dialogForm}>
          <div>
            <label className={styles.dialogLabel}>{t('appointments:detail.createNoteDialog.titleLabel')}</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder={t('appointments:detail.createNoteDialog.titlePlaceholder')}
              className={styles.dialogInput}
              autoFocus
            />
          </div>
          <div>
            <label className={styles.dialogLabel}>{t('appointments:detail.createNoteDialog.descriptionLabel')}</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={t('appointments:detail.createNoteDialog.descriptionPlaceholder')}
              className={styles.dialogTextarea}
            />
          </div>
        </div>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog
        open={viewingNote !== null}
        onClose={() => setViewingNote(null)}
        title={viewingNote?.title ?? ""}
        actions={
          <Button variant="secondary" onClick={() => setViewingNote(null)}>
            {t('common:actions.close')}
          </Button>
        }
      >
        {viewingNote && (
          <div className={styles.dialogNoteView}>
            <div className={styles.noteMeta}>
              {viewingNote.authorUserId} &middot;{" "}
              {formatDateTime(viewingNote.createdAt)}
            </div>
            <div className={styles.viewNoteContent}>{viewingNote.content}</div>
          </div>
        )}
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title={t('appointments:detail.cancelDialog.title')}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelDialog(false)}
            >
              {t('common:actions.back')}
            </Button>
            <Button
              variant="danger"
              onClick={() => cancelMutation.mutate()}
              isLoading={cancelMutation.isPending}
            >
              {t('appointments:detail.cancelDialog.confirmButton')}
            </Button>
          </>
        }
      >
        <div className={styles.dialogForm}>
          <p className={styles.cancelDialogText}>
            {t('appointments:detail.cancelDialog.message')}
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className={styles.cancelDialogTextarea}
          />
        </div>
      </Dialog>
    </div>
  );
}

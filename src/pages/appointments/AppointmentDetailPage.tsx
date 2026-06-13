import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import styles from "./AppointmentDetailPage.module.css";

function formatDateTime(value: string | null): string {
  if (!value) return "\u2014";
  return new Date(value).toLocaleString();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AppointmentDetailPage() {
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
      showToast("Note created.", "success");
      setNoteTitle("");
      setNoteContent("");
      setShowCreateNoteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["appointment-notes", id] });
    },
    onError: () => showToast("Failed to create note.", "error"),
  });

  const invalidateAppointment = () => {
    queryClient.invalidateQueries({ queryKey: ["appointment", id] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptAppointment(id!),
    onSuccess: () => {
      showToast("Appointment accepted.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to accept appointment.", "error"),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineAppointment(id!),
    onSuccess: () => {
      showToast("Appointment declined.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to decline appointment.", "error"),
  });

  const transitMutation = useMutation({
    mutationFn: () => startTransit(id!),
    onSuccess: () => {
      showToast("Transit started.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to start transit.", "error"),
  });

  const serviceMutation = useMutation({
    mutationFn: () => startService(id!),
    onSuccess: () => {
      showToast("Service started.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to start service.", "error"),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeExam(id!),
    onSuccess: () => {
      showToast("Exam completed. Awaiting report.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to complete exam.", "error"),
  });

  const completeAppointmentMutation = useMutation({
    mutationFn: () => completeAppointment(id!),
    onSuccess: () => {
      showToast("Appointment completed.", "success");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to complete appointment.", "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(id!, cancelReason),
    onSuccess: () => {
      showToast("Appointment cancelled.", "success");
      setShowCancelDialog(false);
      setCancelReason("");
      invalidateAppointment();
      refetch();
    },
    onError: () => showToast("Failed to cancel appointment.", "error"),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(id!, file),
    onSuccess: () => {
      showToast("File uploaded successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["appointment-files", id] });
    },
    onError: () => showToast("Failed to upload file.", "error"),
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
        <div className={styles.errorTitle}>Failed to load appointment</div>
        <p className={styles.errorDetail}>
          The appointment could not be found or an error occurred.
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/appointments">
            <Button variant="outline">Back to appointments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Appointment ${appointment.id.substring(0, 8)}`}
        subtitle={appointment.status}
        backLink={{ label: "Back to appointments", to: "/appointments" }}
        actions={
          <StatusBadge status={appointment.status} />
        }
      />

      {/* Appointment Information */}
      <DetailSection title="Appointment information" columns={2}>
        <FieldDisplay label="Appointment ID" value={appointment.id} />
        <FieldDisplay label="Exam Request ID" value={appointment.examRequestId} />
        <FieldDisplay label="Specialist ID" value={appointment.specialistId} />
        <FieldDisplay
          label="Availability Slot ID"
          value={appointment.availabilitySlotId ?? "\u2014"}
        />
        <FieldDisplay
          label="Scheduled Start"
          value={formatDateTime(appointment.scheduledStartAt)}
        />
        <FieldDisplay
          label="Scheduled End"
          value={formatDateTime(appointment.scheduledEndAt)}
        />
        <FieldDisplay
          label="Actual Start"
          value={formatDateTime(appointment.actualStartAt)}
        />
        <FieldDisplay
          label="Actual End"
          value={formatDateTime(appointment.actualEndAt)}
        />
        <FieldDisplay
          label="Notes"
          value={appointment.notes ?? "\u2014"}
        />
        {appointment.cancelReason && (
          <FieldDisplay
            label="Cancel Reason"
            value={appointment.cancelReason}
          />
        )}
        <FieldDisplay
          label="Created"
          value={new Date(appointment.createdAt).toLocaleDateString()}
        />
        <FieldDisplay
          label="Updated"
          value={new Date(appointment.updatedAt).toLocaleDateString()}
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
              Accept
            </Button>
            <Button
              variant="danger"
              onClick={() => declineMutation.mutate()}
              isLoading={declineMutation.isPending}
            >
              Decline
            </Button>
          </>
        )}
        {appointment.status === "ACCEPTED" && (
          <Button
            onClick={() => transitMutation.mutate()}
            isLoading={transitMutation.isPending}
          >
            Start transit
          </Button>
        )}
        {appointment.status === "IN_TRANSIT" && (
          <Button
            onClick={() => serviceMutation.mutate()}
            isLoading={serviceMutation.isPending}
          >
            Start service
          </Button>
        )}
        {appointment.status === "IN_SERVICE" && (
          <Button
            onClick={() => completeMutation.mutate()}
            isLoading={completeMutation.isPending}
          >
            Complete exam
          </Button>
        )}
        {appointment.status === "WAITING_REPORT" && (
          <Link to={`/laudos/new/${id}`}>
            <Button>Create laudo</Button>
          </Link>
        )}
        {appointment.status === "REPORT_ISSUED" && (
          <Button
            onClick={() => completeAppointmentMutation.mutate()}
            isLoading={completeAppointmentMutation.isPending}
          >
            Complete appointment
          </Button>
        )}
        {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status) && (
          <Button variant="danger" onClick={() => setShowCancelDialog(true)}>
            Cancel
          </Button>
        )}
      </div>

      {/* Files Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Exam Files</h3>
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
                Upload files
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
              title="No files uploaded"
              description="No exam files have been uploaded for this appointment yet."
            />
          )}
        </Card>
      </div>

      {/* Laudo Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Laudo</h3>
        {laudo ? (
          <DetailSection columns={2}>
            <FieldDisplay
              label="Status"
              value={<StatusBadge status={laudo.status} />}
            />
            <FieldDisplay
              label="Issued At"
              value={formatDateTime(laudo.issuedAt)}
            />
            {laudo.findings && (
              <FieldDisplay
                label="Findings"
                value={laudo.findings}
                fullWidth
              />
            )}
            {laudo.conclusion && (
              <FieldDisplay
                label="Conclusion"
                value={laudo.conclusion}
                fullWidth
              />
            )}
            <div>
              <Link to={`/laudos/${laudo.id}`}>
                <Button variant="secondary" size="sm">
                  View full laudo
                </Button>
              </Link>
            </div>
          </DetailSection>
        ) : (
          <Card>
            <EmptyState
              title="No laudo yet"
              description="A laudo has not been created for this appointment."
            />
          </Card>
        )}
      </div>

      {/* Notes Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Notes</h3>
          {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status) && (
            <Button
              size="sm"
              onClick={() => setShowCreateNoteDialog(true)}
            >
              Create note
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
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No notes"
              description="No observation notes have been recorded for this appointment."
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
        title="Create note"
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
              Cancel
            </Button>
            <Button
              onClick={() => createNoteMutation.mutate()}
              isLoading={createNoteMutation.isPending}
              disabled={!noteTitle.trim() || !noteContent.trim()}
            >
              Save
            </Button>
          </>
        }
      >
        <div className={styles.dialogForm}>
          <div>
            <label className={styles.dialogLabel}>Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className={styles.dialogInput}
              autoFocus
            />
          </div>
          <div>
            <label className={styles.dialogLabel}>Description</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Describe the observation or incident..."
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
            Close
          </Button>
        }
      >
        {viewingNote && (
          <div className={styles.dialogNoteView}>
            <div className={styles.noteMeta}>
              {viewingNote.authorUserId} &middot;{" "}
              {new Date(viewingNote.createdAt).toLocaleString()}
            </div>
            <div className={styles.viewNoteContent}>{viewingNote.content}</div>
          </div>
        )}
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel appointment"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelDialog(false)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={() => cancelMutation.mutate()}
              isLoading={cancelMutation.isPending}
            >
              Confirm cancellation
            </Button>
          </>
        }
      >
        <div className={styles.dialogForm}>
          <p className={styles.cancelDialogText}>
            Please provide a reason for cancellation:
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

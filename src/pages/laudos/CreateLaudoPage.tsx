import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLaudo, issueLaudo } from "../../api/laudos";
import { uploadFile, listFiles, deleteFile } from "../../api/examFiles";
import { Button, Card, Textarea, Spinner, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection } from "../../components/patterns";
import styles from "./CreateLaudoPage.module.css";

const schema = z.object({
  findings: z.string().optional(),
  conclusion: z.string().optional(),
  recommendations: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(contentType: string): string {
  if (contentType.startsWith("image/")) return "IMG";
  if (contentType.startsWith("video/")) return "VID";
  if (contentType === "application/pdf") return "PDF";
  return "FILE";
}

export function CreateLaudoPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { findings: "", conclusion: "", recommendations: "" },
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["appointment-files", appointmentId],
    queryFn: () => listFiles(appointmentId!),
    enabled: !!appointmentId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(appointmentId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointment-files", appointmentId],
      });
    },
    onError: () => showToast("Failed to upload file.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      showToast("File removed.", "success");
      queryClient.invalidateQueries({
        queryKey: ["appointment-files", appointmentId],
      });
    },
    onError: () => showToast("Failed to remove file.", "error"),
  });

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach((file) => {
        uploadMutation.mutate(file);
      });
    },
    [uploadMutation],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const saveDraftMutation = useMutation({
    mutationFn: (data: FormData) => createLaudo(appointmentId!, data),
    onSuccess: () => {
      showToast("Laudo saved as draft.", "success");
      navigate(`/appointments/${appointmentId}`);
    },
    onError: () => setApiError("Failed to save laudo."),
  });

  const saveAndIssueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const laudo = await createLaudo(appointmentId!, data);
      await issueLaudo(laudo.id);
      return laudo;
    },
    onSuccess: () => {
      showToast("Laudo issued successfully.", "success");
      navigate(`/appointments/${appointmentId}`);
    },
    onError: () => setApiError("Failed to issue laudo."),
  });

  const isSaving =
    saveDraftMutation.isPending || saveAndIssueMutation.isPending;

  const onSaveDraft = handleSubmit((data) => {
    setApiError(null);
    saveDraftMutation.mutate(data);
  });

  const onSaveAndIssue = handleSubmit((data) => {
    setApiError(null);
    saveAndIssueMutation.mutate(data);
  });

  const imageFiles = files?.filter((f) => f.contentType.startsWith("image/")) ?? [];
  const otherFiles = files?.filter((f) => !f.contentType.startsWith("image/")) ?? [];

  return (
    <div>
      <PageHeader
        title="New laudo"
        subtitle={`Create a diagnostic laudo for appointment ${appointmentId?.substring(0, 8)}.`}
        backLink={{ label: "Back to appointment", to: `/appointments/${appointmentId}` }}
      />

      {/* File Upload Section */}
      <Card title="Exam files">
        <div
          className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <div className={styles.dropZoneText}>
            {uploadMutation.isPending
              ? "Uploading..."
              : "Drop files here or click to upload"}
          </div>
          <div className={styles.dropZoneHint}>
            Images, videos, and PDFs accepted
          </div>
        </div>

        {filesLoading && (
          <div className={styles.filesLoading}>
            <Spinner size="sm" />
          </div>
        )}

        {/* Image thumbnails grid */}
        {imageFiles.length > 0 && (
          <div className={styles.imageGrid}>
            {imageFiles.map((file) => (
              <div key={file.id} className={styles.imageCard}>
                <div className={styles.imageThumb}>
                  <span className={styles.imageIcon}>IMG</span>
                </div>
                <div className={styles.imageInfo}>
                  <span className={styles.imageFileName} title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className={styles.imageFileSize}>
                    {formatFileSize(file.sizeBytes)}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => deleteMutation.mutate(file.id)}
                  disabled={deleteMutation.isPending}
                  title="Remove file"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Other files list (videos, PDFs) */}
        {otherFiles.length > 0 && (
          <div className={styles.fileList}>
            {otherFiles.map((file) => (
              <div key={file.id} className={styles.fileItem}>
                <div className={styles.fileTypeTag}>
                  {getFileIcon(file.contentType)}
                </div>
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{file.fileName}</span>
                  <span className={styles.fileMeta}>
                    {formatFileSize(file.sizeBytes)} &middot; {file.contentType}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => deleteMutation.mutate(file.id)}
                  disabled={deleteMutation.isPending}
                  title="Remove file"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {files && files.length === 0 && !filesLoading && (
          <p className={styles.noFiles}>No files uploaded yet.</p>
        )}
      </Card>

      {/* Text Content Section */}
      <Card title="Diagnostic content">
        <div className={styles.form}>
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title="Findings and conclusion">
            <Textarea
              label="Findings"
              placeholder="Describe the diagnostic findings..."
              rows={6}
              {...register("findings")}
            />

            <Textarea
              label="Conclusion"
              placeholder="Summarize the diagnostic conclusion..."
              rows={4}
              {...register("conclusion")}
            />

            <Textarea
              label="Recommendations"
              placeholder="Provide any recommendations for the clinic..."
              rows={4}
              {...register("recommendations")}
            />
          </FormSection>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/appointments/${appointmentId}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveDraft}
              isLoading={saveDraftMutation.isPending}
              disabled={isSaving}
            >
              Save as draft
            </Button>
            <Button
              type="button"
              onClick={onSaveAndIssue}
              isLoading={saveAndIssueMutation.isPending}
              disabled={isSaving}
            >
              Save and issue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

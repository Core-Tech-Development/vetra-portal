import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createExamRequest } from "../../api/examRequests";
import { listPatientsByClinic } from "../../api/patients";
import { useClinicId } from "../../hooks/useClinicId";
import { Card, Select, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import type { CreateExamRequestRequest } from "../../api/types";
import styles from "./CreateExamRequestPage.module.css";

const EXAM_TYPES = [
  { value: "ABDOMINAL_ULTRASOUND", label: "Abdominal ultrasound" },
  { value: "GESTATIONAL_ULTRASOUND", label: "Gestational ultrasound" },
  { value: "MUSCULOSKELETAL_ULTRASOUND", label: "Musculoskeletal ultrasound" },
];

const PRIORITIES = [
  { value: "ROUTINE", label: "Routine" },
  { value: "PRIORITY", label: "Priority" },
  { value: "URGENT", label: "Urgent" },
];

const createExamRequestSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  examType: z.string().min(1, "Select an exam type"),
  priority: z.string().min(1, "Select a priority"),
  diagnosticHypothesis: z.string().optional(),
  clinicalHistory: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type CreateExamRequestForm = z.infer<typeof createExamRequestSchema>;

export function CreateExamRequestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const clinicId = useClinicId();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", clinicId],
    queryFn: () => listPatientsByClinic(clinicId!, 0, 100),
    enabled: !!clinicId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExamRequestForm>({
    resolver: zodResolver(createExamRequestSchema),
    defaultValues: {
      patientId: "",
      examType: "",
      priority: "ROUTINE",
      diagnosticHypothesis: "",
      clinicalHistory: "",
      additionalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateExamRequestRequest) =>
      createExamRequest(clinicId!, data),
    onSuccess: () => {
      showToast("Exam request created successfully.", "success");
      navigate("/exam-requests");
    },
    onError: () => {
      setApiError(
        "Failed to create exam request. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreateExamRequestForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title="New exam request"
        subtitle="Request a diagnostic imaging exam for a patient."
        backLink={{ label: "Back to exam requests", to: "/exam-requests" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title="Exam details">
            <div className={styles.row}>
              <Select
                label="Patient"
                error={errors.patientId?.message}
                disabled={patientsLoading}
                {...register("patientId")}
              >
                <option value="">
                  {patientsLoading ? "Loading patients..." : "Select a patient"}
                </option>
                {patientsData?.content.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.species})
                  </option>
                ))}
              </Select>

              <Select
                label="Exam type"
                error={errors.examType?.message}
                {...register("examType")}
              >
                <option value="">Select exam type</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label="Priority"
              error={errors.priority?.message}
              {...register("priority")}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </FormSection>

          <FormSection title="Clinical information">
            <Textarea
              label="Diagnostic hypothesis"
              placeholder="Describe the diagnostic hypothesis..."
              rows={3}
              {...register("diagnosticHypothesis")}
            />

            <Textarea
              label="Clinical history"
              placeholder="Describe the clinical history..."
              rows={3}
              {...register("clinicalHistory")}
            />

            <Textarea
              label="Additional notes"
              placeholder="Any additional notes or observations..."
              rows={3}
              {...register("additionalNotes")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/exam-requests")}
            submitLabel="Create exam request"
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { createExamRequest } from "../../api/examRequests";
import { listPatientsByClinic } from "../../api/patients";
import { useClinicId } from "../../hooks/useClinicId";
import { Card, Select, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import type { CreateExamRequestRequest } from "../../api/types";
import styles from "./CreateExamRequestPage.module.css";

const createExamRequestSchema = z.object({
  patientId: z.string().min(1, i18next.t('examRequests:create.validation.patientRequired')),
  examType: z.string().min(1, i18next.t('examRequests:create.validation.examTypeRequired')),
  priority: z.string().min(1, i18next.t('examRequests:create.validation.priorityRequired')),
  diagnosticHypothesis: z.string().optional(),
  clinicalHistory: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type CreateExamRequestForm = z.infer<typeof createExamRequestSchema>;

export function CreateExamRequestPage() {
  const { t } = useTranslation(['examRequests', 'common']);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const clinicId = useClinicId();
  const [apiError, setApiError] = useState<string | null>(null);

  const EXAM_TYPES = [
    { value: "ABDOMINAL_ULTRASOUND", label: t('common:examTypes.ABDOMINAL_ULTRASOUND') },
    { value: "GESTATIONAL_ULTRASOUND", label: t('common:examTypes.GESTATIONAL_ULTRASOUND') },
    { value: "MUSCULOSKELETAL_ULTRASOUND", label: t('common:examTypes.MUSCULOSKELETAL_ULTRASOUND') },
  ];

  const PRIORITIES = [
    { value: "ROUTINE", label: t('common:priority.ROUTINE') },
    { value: "PRIORITY", label: t('common:priority.PRIORITY') },
    { value: "URGENT", label: t('common:priority.URGENT') },
  ];

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
      showToast(t('examRequests:create.toast.success'), "success");
      navigate("/exam-requests");
    },
    onError: () => {
      setApiError(t('examRequests:create.toast.error'));
    },
  });

  const onSubmit = (data: CreateExamRequestForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title={t('examRequests:create.title')}
        subtitle={t('examRequests:create.subtitle')}
        backLink={{ label: t('examRequests:create.backLink'), to: "/exam-requests" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('examRequests:create.sections.examDetails')}>
            <div className={styles.row}>
              <Select
                label={t('examRequests:create.fields.patient')}
                error={errors.patientId?.message}
                disabled={patientsLoading}
                {...register("patientId")}
              >
                <option value="">
                  {patientsLoading ? t('examRequests:create.fields.patientLoading') : t('examRequests:create.fields.patientPlaceholder')}
                </option>
                {patientsData?.content.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.species})
                  </option>
                ))}
              </Select>

              <Select
                label={t('examRequests:create.fields.examType')}
                error={errors.examType?.message}
                {...register("examType")}
              >
                <option value="">{t('examRequests:create.fields.examTypePlaceholder')}</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label={t('examRequests:create.fields.priority')}
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

          <FormSection title={t('examRequests:create.sections.clinicalInformation')}>
            <Textarea
              label={t('examRequests:create.fields.diagnosticHypothesis')}
              placeholder={t('examRequests:create.fields.diagnosticHypothesisPlaceholder')}
              rows={3}
              {...register("diagnosticHypothesis")}
            />

            <Textarea
              label={t('examRequests:create.fields.clinicalHistory')}
              placeholder={t('examRequests:create.fields.clinicalHistoryPlaceholder')}
              rows={3}
              {...register("clinicalHistory")}
            />

            <Textarea
              label={t('examRequests:create.fields.additionalNotes')}
              placeholder={t('examRequests:create.fields.additionalNotesPlaceholder')}
              rows={3}
              {...register("additionalNotes")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/exam-requests")}
            submitLabel={t('examRequests:create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

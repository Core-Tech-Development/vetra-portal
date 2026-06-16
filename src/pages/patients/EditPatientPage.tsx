import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { getPatient, updatePatient } from "../../api/patients";
import { Card, Input, Select, Spinner, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreatePatientPage.module.css";

const editPatientSchema = z.object({
  name: z.string().min(1, i18next.t('patients:create.validation.nameRequired')),
  species: z.string().min(1, i18next.t('patients:create.validation.speciesRequired')),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birthDate: z.string().optional(),
  weightKg: z.string().optional(),
  neutered: z.boolean(),
  microchip: z.string().optional(),
  clinicalNotes: z.string().optional(),
});

type EditPatientForm = z.infer<typeof editPatientSchema>;

export function EditPatientPage() {
  const { t } = useTranslation(['patients', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const SPECIES_OPTIONS = [
    { value: "DOG", label: t('common:species.DOG') },
    { value: "CAT", label: t('common:species.CAT') },
    { value: "BIRD", label: t('common:species.BIRD') },
    { value: "HORSE", label: t('common:species.HORSE') },
    { value: "RABBIT", label: t('common:species.RABBIT') },
    { value: "REPTILE", label: t('common:species.REPTILE') },
    { value: "OTHER", label: t('common:species.OTHER') },
  ];

  const SEX_OPTIONS = [
    { value: "MALE", label: t('common:sex.MALE') },
    { value: "FEMALE", label: t('common:sex.FEMALE') },
  ];

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPatientForm>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        species: patient.species,
        breed: patient.breed ?? "",
        sex: patient.sex ?? "",
        birthDate: patient.birthDate ?? "",
        weightKg: patient.weightKg != null ? String(patient.weightKg) : "",
        neutered: patient.neutered ?? false,
        microchip: patient.microchip ?? "",
        clinicalNotes: patient.clinicalNotes ?? "",
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditPatientForm) =>
      updatePatient(id!, {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        sex: data.sex || undefined,
        birthDate: data.birthDate || undefined,
        weightKg:
          data.weightKg !== "" && data.weightKg !== undefined
            ? Number(data.weightKg)
            : undefined,
        neutered: data.neutered,
        microchip: data.microchip || undefined,
        clinicalNotes: data.clinicalNotes || undefined,
      }),
    onSuccess: () => {
      showToast(t('patients:edit.toast.success'), "success");
      navigate("/patients");
    },
    onError: () => {
      setApiError(t('patients:edit.toast.error'));
    },
  });

  const onSubmit = (data: EditPatientForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('patients:edit.title')}
        subtitle={t('patients:edit.subtitle')}
        backLink={{ label: t('patients:edit.backLink'), to: "/patients" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('patients:create.sections.general')}>
            <Input
              label={t('patients:create.fields.patientName')}
              placeholder={t('patients:create.fields.patientNamePlaceholder')}
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Select
                label={t('patients:create.fields.species')}
                error={errors.species?.message}
                {...register("species")}
              >
                <option value="">{t('patients:create.fields.speciesPlaceholder')}</option>
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Input
                label={t('patients:create.fields.breed')}
                placeholder={t('patients:create.fields.breedPlaceholder')}
                error={errors.breed?.message}
                {...register("breed")}
              />
            </div>

            <div className={styles.row}>
              <Select
                label={t('patients:create.fields.sex')}
                error={errors.sex?.message}
                {...register("sex")}
              >
                <option value="">{t('patients:create.fields.sexPlaceholder')}</option>
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Input
                label={t('patients:create.fields.birthDate')}
                type="date"
                error={errors.birthDate?.message}
                {...register("birthDate")}
              />
            </div>
          </FormSection>

          <FormSection title={t('patients:create.sections.details')}>
            <div className={styles.row}>
              <Input
                label={t('patients:create.fields.weightKg')}
                type="number"
                step="0.01"
                placeholder={t('patients:create.fields.weightKgPlaceholder')}
                error={errors.weightKg?.message}
                {...register("weightKg")}
              />
              <Input
                label={t('patients:create.fields.microchip')}
                placeholder={t('patients:create.fields.microchipPlaceholder')}
                error={errors.microchip?.message}
                {...register("microchip")}
              />
            </div>

            <div className={styles.checkboxField}>
              <input
                type="checkbox"
                id="neutered"
                {...register("neutered")}
              />
              <label htmlFor="neutered" className={styles.checkboxLabel}>
                {t('patients:create.fields.neutered')}
              </label>
            </div>

            <Textarea
              label={t('patients:create.fields.clinicalNotes')}
              placeholder={t('patients:create.fields.clinicalNotesPlaceholder')}
              rows={3}
              error={errors.clinicalNotes?.message}
              {...register("clinicalNotes")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/patients")}
            submitLabel={t('patients:edit.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

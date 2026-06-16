import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { createPatient } from "../../api/patients";
import { listTutorsByClinic } from "../../api/tutors";
import { useClinicId } from "../../hooks/useClinicId";
import { Card, Input, Select, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreatePatientPage.module.css";

const createPatientSchema = z.object({
  tutorId: z.string().min(1, i18next.t('patients:create.validation.tutorRequired')),
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

type CreatePatientForm = z.infer<typeof createPatientSchema>;

export function CreatePatientPage() {
  const { t } = useTranslation(['patients', 'common']);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = useClinicId();

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

  const { data: tutorsData } = useQuery({
    queryKey: ["tutors", clinicId],
    queryFn: () => listTutorsByClinic(clinicId!, 0, 100),
    enabled: !!clinicId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      tutorId: "",
      name: "",
      species: "",
      breed: "",
      sex: "",
      birthDate: "",
      weightKg: "",
      neutered: false,
      microchip: "",
      clinicalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePatientForm) => {
      const { tutorId, ...rest } = data;
      return createPatient(clinicId!, tutorId, {
        name: rest.name,
        species: rest.species,
        breed: rest.breed || undefined,
        sex: rest.sex || undefined,
        birthDate: rest.birthDate || undefined,
        weightKg:
          rest.weightKg !== "" && rest.weightKg !== undefined
            ? Number(rest.weightKg)
            : undefined,
        neutered: rest.neutered,
        microchip: rest.microchip || undefined,
        clinicalNotes: rest.clinicalNotes || undefined,
      });
    },
    onSuccess: () => {
      showToast(t('patients:create.toast.success'), "success");
      navigate("/patients");
    },
    onError: () => {
      setApiError(t('patients:create.toast.error'));
    },
  });

  const onSubmit = (data: CreatePatientForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title={t('patients:create.title')}
        subtitle={t('patients:create.subtitle')}
        backLink={{ label: t('patients:create.backLink'), to: "/patients" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('patients:create.sections.general')}>
            <Select
              label={t('patients:create.fields.tutor')}
              error={errors.tutorId?.message}
              {...register("tutorId")}
            >
              <option value="">{t('patients:create.fields.tutorPlaceholder')}</option>
              {tutorsData?.content.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </Select>

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
            submitLabel={t('patients:create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

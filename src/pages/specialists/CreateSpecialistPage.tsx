import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createSpecialist } from "../../api/specialists";
import { Card, Input, Select, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import type { CreateSpecialistRequest } from "../../api/types";
import styles from "./CreateSpecialistPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const createSpecialistSchema = z.object({
  name: z.string().min(1, i18next.t('common:validation.required', { field: i18next.t('specialists:create.fields.fullName') })),
  email: z.string().email(i18next.t('common:validation.validEmailRequired')),
  phone: z.string().optional(),
  crmv: z.string().min(1, i18next.t('common:validation.required', { field: i18next.t('specialists:create.fields.crmv') })),
  crmvState: z.string().min(2, i18next.t('common:validation.required', { field: i18next.t('specialists:create.fields.crmvState') })),
  specialty: z.string().min(1, i18next.t('common:validation.required', { field: i18next.t('specialists:create.fields.specialty') })),
  baseCity: z.string().optional(),
  baseState: z.string().optional(),
  maxTravelRadiusKm: z.string().optional(),
  hasOwnEquipment: z.boolean(),
  bio: z.string().optional(),
});

type CreateSpecialistForm = z.infer<typeof createSpecialistSchema>;

export function CreateSpecialistPage() {
  const { t } = useTranslation('specialists');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSpecialistForm>({
    resolver: zodResolver(createSpecialistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      crmv: "",
      crmvState: "",
      specialty: "",
      baseCity: "",
      baseState: "",
      maxTravelRadiusKm: "",
      hasOwnEquipment: false,
      bio: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateSpecialistRequest) => createSpecialist(data),
    onSuccess: () => {
      showToast(t('create.toast.success'), "success");
      navigate("/specialists");
    },
    onError: () => {
      setApiError(t('create.toast.error'));
    },
  });

  const onSubmit = (data: CreateSpecialistForm) => {
    setApiError(null);
    const payload: CreateSpecialistRequest = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      crmv: data.crmv,
      crmvState: data.crmvState,
      specialty: data.specialty,
      baseCity: data.baseCity || undefined,
      baseState: data.baseState || undefined,
      maxTravelRadiusKm:
        data.maxTravelRadiusKm ? Number(data.maxTravelRadiusKm) : undefined,
      hasOwnEquipment: data.hasOwnEquipment,
      bio: data.bio || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div>
      <PageHeader
        title={t('create.title')}
        subtitle={t('create.subtitle')}
        backLink={{ label: t('create.backLink'), to: "/specialists" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('create.sections.personalInformation')}>
            <Input
              label={t('create.fields.fullName')}
              placeholder={t('create.fields.fullNamePlaceholder')}
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label={t('create.fields.email')}
                type="email"
                placeholder={t('create.fields.emailPlaceholder')}
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label={t('create.fields.phone')}
                type="tel"
                placeholder={t('create.fields.phonePlaceholder')}
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
          </FormSection>

          <FormSection title={t('create.sections.professionalRegistration')}>
            <div className={styles.row}>
              <Input
                label={t('create.fields.crmv')}
                placeholder={t('create.fields.crmvPlaceholder')}
                error={errors.crmv?.message}
                {...register("crmv")}
              />
              <Select
                label={t('create.fields.crmvState')}
                error={errors.crmvState?.message}
                {...register("crmvState")}
              >
                <option value="">{t('create.fields.crmvStatePlaceholder')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label={t('create.fields.specialty')}
              error={errors.specialty?.message}
              {...register("specialty")}
            >
              <option value="">{t('create.fields.specialtyPlaceholder')}</option>
              {(["ABDOMINAL_ULTRASOUND", "GESTATIONAL_ULTRASOUND", "MUSCULOSKELETAL_ULTRASOUND"] as const).map((sp) => (
                <option key={sp} value={sp}>
                  {t(`create.specialties.${sp}`)}
                </option>
              ))}
            </Select>
          </FormSection>

          <FormSection title={t('create.sections.coverageArea')}>
            <div className={styles.row}>
              <Input
                label={t('create.fields.baseCity')}
                placeholder={t('create.fields.baseCityPlaceholder')}
                error={errors.baseCity?.message}
                {...register("baseCity")}
              />
              <Select
                label={t('create.fields.baseState')}
                error={errors.baseState?.message}
                {...register("baseState")}
              >
                <option value="">{t('create.fields.baseStatePlaceholder')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label={t('create.fields.maxTravelRadius')}
              type="number"
              placeholder={t('create.fields.maxTravelRadiusPlaceholder')}
              error={errors.maxTravelRadiusKm?.message}
              {...register("maxTravelRadiusKm")}
            />

            <div className={styles.checkboxField}>
              <input
                type="checkbox"
                id="hasOwnEquipment"
                {...register("hasOwnEquipment")}
              />
              <label htmlFor="hasOwnEquipment" className={styles.checkboxLabel}>
                {t('create.fields.hasOwnEquipment')}
              </label>
            </div>
          </FormSection>

          <FormSection title={t('create.sections.bio')}>
            <Textarea
              label={t('create.fields.bio')}
              placeholder={t('create.fields.bioPlaceholder')}
              error={errors.bio?.message}
              {...register("bio")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/specialists")}
            submitLabel={t('create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

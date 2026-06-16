import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createClinic } from "../../api/clinics";
import { Card, Input, Select, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import type { CreateClinicRequest } from "../../api/types";
import styles from "./CreateClinicPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const createClinicSchema = z.object({
  name: z.string().min(2, i18next.t('common:validation.nameMinLength')),
  document: z.string().min(14, i18next.t('common:validation.invalidCnpj')),
  email: z.string().email(i18next.t('common:validation.invalidEmail')),
  phone: z.string().min(10, i18next.t('common:validation.invalidPhone')),
  address: z.string().min(5, i18next.t('common:validation.enterFullAddress')),
  city: z.string().min(2, i18next.t('common:validation.enterCity')),
  state: z.string().min(2, i18next.t('common:validation.selectState')),
});

type CreateClinicForm = z.infer<typeof createClinicSchema>;

export function CreateClinicPage() {
  const { t } = useTranslation('clinics');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClinicForm>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateClinicRequest) => createClinic(data),
    onSuccess: () => {
      showToast(t('create.toast.success'), "success");
      navigate("/clinics");
    },
    onError: () => {
      setApiError(t('create.toast.error'));
    },
  });

  const onSubmit = (data: CreateClinicForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title={t('create.title')}
        subtitle={t('create.subtitle')}
        backLink={{ label: t('create.backLink'), to: "/clinics" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('create.sections.clinicInformation')}>
            <Input
              label={t('create.fields.clinicName')}
              placeholder={t('create.fields.clinicNamePlaceholder')}
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label={t('create.fields.cnpj')}
                placeholder={t('create.fields.cnpjPlaceholder')}
                error={errors.document?.message}
                {...register("document")}
              />
              <Input
                label={t('create.fields.email')}
                type="email"
                placeholder={t('create.fields.emailPlaceholder')}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <Input
              label={t('create.fields.phone')}
              type="tel"
              placeholder={t('create.fields.phonePlaceholder')}
              error={errors.phone?.message}
              {...register("phone")}
            />
          </FormSection>

          <FormSection title={t('create.sections.address')}>
            <Input
              label={t('create.fields.address')}
              placeholder={t('create.fields.addressPlaceholder')}
              error={errors.address?.message}
              {...register("address")}
            />

            <div className={styles.row}>
              <Input
                label={t('create.fields.city')}
                placeholder={t('create.fields.cityPlaceholder')}
                error={errors.city?.message}
                {...register("city")}
              />
              <Select
                label={t('create.fields.state')}
                error={errors.state?.message}
                {...register("state")}
              >
                <option value="">{t('create.fields.statePlaceholder')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>
          </FormSection>

          <FormActions
            onCancel={() => navigate("/clinics")}
            submitLabel={t('create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

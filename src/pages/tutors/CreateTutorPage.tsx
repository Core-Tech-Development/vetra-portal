import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { createTutor } from "../../api/tutors";
import { Card, Input, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateTutorPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

const createTutorSchema = z.object({
  name: z.string().min(1, i18next.t('tutors:create.validation.nameRequired')),
  phone: z.string().optional(),
  email: z.string().email(i18next.t('tutors:create.validation.validEmailRequired')).optional().or(z.literal("")),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type CreateTutorForm = z.infer<typeof createTutorSchema>;

export function CreateTutorPage() {
  const { t } = useTranslation(['tutors', 'common']);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = getClinicId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTutorForm>({
    resolver: zodResolver(createTutorSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTutorForm) =>
      createTutor(clinicId, {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        document: data.document,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
      }),
    onSuccess: () => {
      showToast(t('tutors:create.toast.success'), "success");
      navigate("/tutors");
    },
    onError: () => {
      setApiError(t('tutors:create.toast.error'));
    },
  });

  const onSubmit = (data: CreateTutorForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title={t('tutors:create.title')}
        subtitle={t('tutors:create.subtitle')}
        backLink={{ label: t('tutors:create.backLink'), to: "/tutors" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('tutors:create.sections.personalInformation')}>
            <Input
              label={t('tutors:create.fields.fullName')}
              placeholder={t('tutors:create.fields.fullNamePlaceholder')}
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label={t('tutors:create.fields.phone')}
                type="tel"
                placeholder={t('tutors:create.fields.phonePlaceholder')}
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label={t('tutors:create.fields.email')}
                type="email"
                placeholder={t('tutors:create.fields.emailPlaceholder')}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <Input
              label={t('tutors:create.fields.document')}
              placeholder={t('tutors:create.fields.documentPlaceholder')}
              error={errors.document?.message}
              {...register("document")}
            />
          </FormSection>

          <FormSection title={t('tutors:create.sections.address')}>
            <Input
              label={t('tutors:create.fields.address')}
              placeholder={t('tutors:create.fields.addressPlaceholder')}
              error={errors.address?.message}
              {...register("address")}
            />

            <div className={styles.row}>
              <Input
                label={t('tutors:create.fields.city')}
                placeholder={t('tutors:create.fields.cityPlaceholder')}
                error={errors.city?.message}
                {...register("city")}
              />
              <Input
                label={t('tutors:create.fields.state')}
                placeholder={t('tutors:create.fields.statePlaceholder')}
                error={errors.state?.message}
                {...register("state")}
              />
            </div>

            <Input
              label={t('tutors:create.fields.zipCode')}
              placeholder={t('tutors:create.fields.zipCodePlaceholder')}
              error={errors.zipCode?.message}
              {...register("zipCode")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/tutors")}
            submitLabel={t('tutors:create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

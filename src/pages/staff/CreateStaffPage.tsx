import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { createClinicStaff } from "../../api/clinicStaff";
import { Card, Input, Select, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateStaffPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

const createStaffSchema = z.object({
  name: z.string().min(1, i18next.t('staff:create.validation.nameRequired')),
  email: z.string().min(1, i18next.t('staff:create.validation.emailRequired')).email(i18next.t('staff:create.validation.validEmailRequired')),
  phone: z.string().optional(),
  role: z.string().min(1, i18next.t('staff:create.validation.roleRequired')),
  password: z.string().min(8, i18next.t('staff:create.validation.passwordMinLength')),
  confirmPassword: z.string().min(1, i18next.t('staff:create.validation.confirmPasswordRequired')),
}).refine((data) => data.password === data.confirmPassword, {
  message: i18next.t('staff:create.validation.passwordsDoNotMatch'),
  path: ["confirmPassword"],
});

type CreateStaffForm = z.infer<typeof createStaffSchema>;

export function CreateStaffPage() {
  const { t } = useTranslation(['staff', 'common']);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = getClinicId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStaffForm>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateStaffForm) =>
      createClinicStaff(clinicId, {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        password: data.password,
      }),
    onSuccess: () => {
      showToast(t('staff:create.toast.success'), "success");
      navigate("/staff");
    },
    onError: () => {
      setApiError(t('staff:create.toast.error'));
    },
  });

  const onSubmit = (data: CreateStaffForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title={t('staff:create.title')}
        subtitle={t('staff:create.subtitle')}
        backLink={{ label: t('staff:create.backLink'), to: "/staff" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title={t('staff:create.sections.personalInformation')}>
            <Input
              label={t('staff:create.fields.fullName')}
              placeholder={t('staff:create.fields.fullNamePlaceholder')}
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label={t('staff:create.fields.email')}
                type="email"
                placeholder={t('staff:create.fields.emailPlaceholder')}
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label={t('staff:create.fields.phone')}
                type="tel"
                placeholder={t('staff:create.fields.phonePlaceholder')}
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <Select
              label={t('staff:create.fields.role')}
              error={errors.role?.message}
              {...register("role")}
            >
              <option value="">{t('staff:create.fields.rolePlaceholder')}</option>
              <option value="VETERINARIAN">{t('common:staffRoles.VETERINARIAN')}</option>
              <option value="SECRETARY">{t('common:staffRoles.SECRETARY')}</option>
            </Select>
          </FormSection>

          <FormSection title={t('staff:create.sections.credentials')}>
            <div className={styles.row}>
              <Input
                label={t('staff:create.fields.password')}
                type="password"
                placeholder={t('staff:create.fields.passwordPlaceholder')}
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label={t('staff:create.fields.confirmPassword')}
                type="password"
                placeholder={t('staff:create.fields.confirmPasswordPlaceholder')}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </FormSection>

          <FormActions
            onCancel={() => navigate("/staff")}
            submitLabel={t('staff:create.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

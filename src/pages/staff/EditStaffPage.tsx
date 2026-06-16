import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { getClinicStaff, updateClinicStaff } from "../../api/clinicStaff";
import { Card, Input, Select, Spinner, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateStaffPage.module.css";

const editStaffSchema = z.object({
  name: z.string().min(1, i18next.t('staff:edit.validation.nameRequired')),
  phone: z.string().optional(),
  role: z.string().min(1, i18next.t('staff:edit.validation.roleRequired')),
});

type EditStaffForm = z.infer<typeof editStaffSchema>;

export function EditStaffPage() {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["clinic-staff-detail", id],
    queryFn: () => getClinicStaff(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStaffForm>({
    resolver: zodResolver(editStaffSchema),
  });

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        phone: staff.phone ?? "",
        role: staff.role,
      });
    }
  }, [staff, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditStaffForm) =>
      updateClinicStaff(id!, {
        name: data.name,
        phone: data.phone || undefined,
        role: data.role,
      }),
    onSuccess: () => {
      showToast(t('staff:edit.toast.success'), "success");
      navigate("/staff");
    },
    onError: () => {
      setApiError(t('staff:edit.toast.error'));
    },
  });

  const onSubmit = (data: EditStaffForm) => {
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
        title={t('staff:edit.title')}
        subtitle={t('staff:edit.subtitle')}
        backLink={{ label: t('staff:edit.backLink'), to: "/staff" }}
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
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  {t('staff:create.fields.email')}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    padding: "0.5rem 0",
                  }}
                >
                  {staff?.email ?? "-"}
                </span>
              </div>
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

          <FormActions
            onCancel={() => navigate("/staff")}
            submitLabel={t('staff:edit.submitButton')}
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}

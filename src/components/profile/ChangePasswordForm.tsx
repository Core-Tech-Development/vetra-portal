import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../api/auth";
import { Button, Card, Input } from "../ui";
import { useToast } from "../ui/Toast";
import type { AxiosError } from "axios";
import styles from "./ChangePasswordForm.module.css";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordForm() {
  const { t } = useTranslation("common");
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPasswordValue = watch("newPassword");

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      showToast(t("profile.changePassword.success"), "success");
      reset();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 400 || error.response?.status === 401) {
        showToast(t("profile.changePassword.invalidCurrentPassword"), "error");
      } else {
        showToast(t("profile.changePassword.error"), "error");
      }
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  });

  return (
    <Card title={t("profile.changePassword.title")}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Input
          label={t("profile.changePassword.currentPassword")}
          type="password"
          placeholder={t("profile.changePassword.currentPasswordPlaceholder")}
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: t("validation.required", {
              field: t("profile.changePassword.currentPassword"),
            }),
          })}
        />
        <Input
          label={t("profile.changePassword.newPassword")}
          type="password"
          placeholder={t("profile.changePassword.newPasswordPlaceholder")}
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: t("validation.required", {
              field: t("profile.changePassword.newPassword"),
            }),
            minLength: {
              value: 8,
              message: t("profile.changePassword.minLength"),
            },
          })}
        />
        <Input
          label={t("profile.changePassword.confirmPassword")}
          type="password"
          placeholder={t("profile.changePassword.confirmPasswordPlaceholder")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: t("validation.required", {
              field: t("profile.changePassword.confirmPassword"),
            }),
            validate: (value) =>
              value === newPasswordValue ||
              t("profile.changePassword.passwordMismatch"),
          })}
        />
        <div className={styles.actions}>
          <Button type="submit" isLoading={mutation.isPending}>
            {t("profile.changePassword.title")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

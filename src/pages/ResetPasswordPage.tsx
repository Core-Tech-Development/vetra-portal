import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useAuth } from "../auth/useAuth";
import { Button, Input, Alert } from "../components/ui";
import styles from "./ResetPasswordPage.module.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, i18next.t("common:validation.passwordMinLength")),
    confirmPassword: z.string().min(1, i18next.t("common:validation.confirmPasswordRequired")),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18next.t("common:validation.passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.brandingPanel}>
          <img src="/logo.png" alt="Vetra" className={styles.brandingLogo} />
          <h1 className={styles.brandingTagline}>
            {t("branding.tagline")}
          </h1>
          <p className={styles.brandingDescription}>
            {t("branding.description")}
          </p>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.mobileLogo}>
              <img src="/logo.png" alt="Vetra" className={styles.logoImg} />
            </div>
            <h2 className={styles.heading}>{t("resetPassword.invalidLinkHeading")}</h2>
            <p className={styles.subtitle}>
              {t("resetPassword.invalidLinkMessage")}
            </p>
            <Link to="/forgot-password" className={styles.backLink}>
              <ArrowLeft size={16} />
              {t("resetPassword.requestNewLink")}
            </Link>
            <div className={styles.divider} />
            <p className={styles.footer}>{t("footer")}</p>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetForm) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || t("common:errors.genericError"),
        );
      }

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("common:errors.unexpectedError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel — desktop only */}
      <div className={styles.brandingPanel}>
        <img src="/logo.png" alt="Vetra" className={styles.brandingLogo} />
        <h1 className={styles.brandingTagline}>
          {t("branding.tagline")}
        </h1>
        <p className={styles.brandingDescription}>
          {t("branding.description")}
        </p>
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          {/* Logo — mobile only */}
          <div className={styles.mobileLogo}>
            <img src="/logo.png" alt="Vetra" className={styles.logoImg} />
          </div>

          {isSuccess ? (
            /* Success state */
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <CheckCircle size={48} />
              </div>
              <h2 className={styles.heading}>{t("resetPassword.successHeading")}</h2>
              <p className={styles.successMessage}>
                {t("resetPassword.successMessage")}
              </p>
              <div className={styles.successActions}>
                <Link to="/login">
                  <Button variant="primary" fullWidth>
                    {t("resetPassword.signInButton")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className={styles.heading}>{t("resetPassword.heading")}</h2>
              <p className={styles.subtitle}>
                {t("resetPassword.subtitle")}
              </p>

              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {error && <Alert variant="danger">{error}</Alert>}

                <Input
                  label={t("resetPassword.newPasswordLabel")}
                  type="password"
                  placeholder={t("resetPassword.newPasswordPlaceholder")}
                  autoComplete="new-password"
                  leftIcon={<Lock size={18} />}
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />

                <Input
                  label={t("resetPassword.confirmPasswordLabel")}
                  type="password"
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                  leftIcon={<Lock size={18} />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  className={styles.submitButton}
                >
                  {t("resetPassword.submitButton")}
                </Button>
              </form>

              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                {t("resetPassword.backToSignIn")}
              </Link>
            </>
          )}

          <div className={styles.divider} />
          <p className={styles.footer}>{t("footer")}</p>
        </div>
      </div>
    </div>
  );
}

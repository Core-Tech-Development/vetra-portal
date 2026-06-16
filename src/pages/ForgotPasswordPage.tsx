import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18next from "i18next";
import { useAuth } from "../auth/useAuth";
import { Button, Input, Alert } from "../components/ui";
import styles from "./ForgotPasswordPage.module.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, i18next.t("auth:forgotPassword.emailRequired"))
    .email(i18next.t("auth:forgotPassword.invalidEmail")),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("auth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: ForgotForm) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || t("common:errors.genericError"),
        );
      }

      setSubmittedEmail(data.email);
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
              <h2 className={styles.heading}>{t("forgotPassword.successHeading")}</h2>
              <p className={styles.successMessage}>
                <Trans
                  i18nKey="forgotPassword.successMessage"
                  ns="auth"
                  values={{ email: submittedEmail }}
                  components={{ strong: <strong /> }}
                />
              </p>
              <p className={styles.successHint}>
                {t("forgotPassword.successHint")}
              </p>
              <div className={styles.successActions}>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmittedEmail("");
                  }}
                >
                  {t("forgotPassword.tryAnotherEmail")}
                </Button>
                <Link to="/login" className={styles.backLink}>
                  <ArrowLeft size={16} />
                  {t("forgotPassword.backToSignIn")}
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className={styles.heading}>{t("forgotPassword.heading")}</h2>
              <p className={styles.subtitle}>
                {t("forgotPassword.subtitle")}
              </p>

              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {error && <Alert variant="danger">{error}</Alert>}

                <Input
                  label={t("forgotPassword.emailLabel")}
                  type="email"
                  placeholder={t("forgotPassword.emailPlaceholder")}
                  autoComplete="email"
                  leftIcon={<Mail size={18} />}
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  className={styles.submitButton}
                >
                  {t("forgotPassword.submitButton")}
                </Button>
              </form>

              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                {t("forgotPassword.backToSignIn")}
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

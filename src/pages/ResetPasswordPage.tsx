import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Button, Input, Alert } from "../components/ui";
import styles from "./ResetPasswordPage.module.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
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
            Veterinary Diagnostic Imaging Platform
          </h1>
          <p className={styles.brandingDescription}>
            Connecting veterinary clinics to specialist diagnosticians — anytime,
            anywhere.
          </p>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <div className={styles.mobileLogo}>
              <img src="/logo.png" alt="Vetra" className={styles.logoImg} />
            </div>
            <h2 className={styles.heading}>Invalid link</h2>
            <p className={styles.subtitle}>
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className={styles.backLink}>
              <ArrowLeft size={16} />
              Request a new reset link
            </Link>
            <div className={styles.divider} />
            <p className={styles.footer}>Secured by Keycloak</p>
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
          errorData?.message || "An error occurred. Please try again.",
        );
      }

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
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
          Veterinary Diagnostic Imaging Platform
        </h1>
        <p className={styles.brandingDescription}>
          Connecting veterinary clinics to specialist diagnosticians — anytime,
          anywhere.
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
              <h2 className={styles.heading}>Password reset</h2>
              <p className={styles.successMessage}>
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <div className={styles.successActions}>
                <Link to="/login">
                  <Button variant="primary" fullWidth>
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className={styles.heading}>Create new password</h2>
              <p className={styles.subtitle}>
                Enter a new password for your account. It must be at least 8
                characters long.
              </p>

              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {error && <Alert variant="danger">{error}</Alert>}

                <Input
                  label="New password"
                  type="password"
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  leftIcon={<Lock size={18} />}
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Confirm your new password"
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
                  Reset password
                </Button>
              </form>

              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </>
          )}

          <div className={styles.divider} />
          <p className={styles.footer}>Secured by Keycloak</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Button, Input, Alert } from "../components/ui";
import styles from "./ForgotPasswordPage.module.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
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
          errorData?.message || "An error occurred. Please try again.",
        );
      }

      setSubmittedEmail(data.email);
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
              <h2 className={styles.heading}>Check your email</h2>
              <p className={styles.successMessage}>
                If an account exists for <strong>{submittedEmail}</strong>, you
                will receive a password reset link shortly.
              </p>
              <p className={styles.successHint}>
                Didn't receive an email? Check your spam folder or make sure you
                entered the correct address.
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
                  Try another email
                </Button>
                <Link to="/login" className={styles.backLink}>
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className={styles.heading}>Reset your password</h2>
              <p className={styles.subtitle}>
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {error && <Alert variant="danger">{error}</Alert>}

                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
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
                  Send reset link
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

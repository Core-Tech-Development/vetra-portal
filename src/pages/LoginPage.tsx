import { useState, useRef, useCallback, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import "altcha";
import "altcha/types/react";
import { useAuth } from "../auth/useAuth";
import { getResetPasswordUrl, fetchCaptchaChallenge } from "../auth/keycloakTokenService";
import type { CaptchaChallenge } from "../auth/keycloakTokenService";
import { Button, Input, Alert } from "../components/ui";
import styles from "./LoginPage.module.css";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [captchaSolution, setCaptchaSolution] = useState<string | null>(null);
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const altchaRef = useRef<HTMLElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Load CAPTCHA challenge
  const loadChallenge = useCallback(async () => {
    try {
      setCaptchaError(false);
      const challenge = await fetchCaptchaChallenge();
      setCaptchaChallenge(challenge);
    } catch {
      setCaptchaError(true);
    }
  }, []);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  // Listen for Altcha verification events
  useEffect(() => {
    const el = altchaRef.current;
    if (!el) return;

    const handleVerification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.payload) {
        setCaptchaSolution(detail.payload);
      }
    };

    const handleStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.state === "expired" || detail?.state === "error") {
        setCaptchaSolution(null);
      }
    };

    el.addEventListener("verification", handleVerification);
    el.addEventListener("statechange", handleStateChange);

    return () => {
      el.removeEventListener("verification", handleVerification);
      el.removeEventListener("statechange", handleStateChange);
    };
  }, [captchaChallenge]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    if (!captchaSolution) {
      setAuthError("Please complete the CAPTCHA verification.");
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);

    try {
      await loginWithCredentials(data.username, data.password, captchaSolution);
      navigate("/", { replace: true });
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
      // Reset CAPTCHA after failed attempt
      setCaptchaSolution(null);
      loadChallenge();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel — desktop only */}
      <div className={styles.brandingPanel}>
        <img
          src="/logo.png"
          alt="Vetra"
          className={styles.brandingLogo}
        />
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

          <h2 className={styles.heading}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account</p>

          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {authError && (
              <Alert variant="danger">{authError}</Alert>
            )}

            <Input
              label="Username"
              placeholder="you@example.com"
              autoComplete="username"
              leftIcon={<Mail size={18} />}
              error={errors.username?.message}
              {...register("username")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Altcha CAPTCHA Widget */}
            <div className={styles.captchaWrapper}>
              {captchaError ? (
                <div className={styles.captchaError}>
                  <p>Failed to load CAPTCHA.</p>
                  <button type="button" onClick={loadChallenge} className={styles.captchaRetry}>
                    Retry
                  </button>
                </div>
              ) : captchaChallenge ? (
                <altcha-widget
                  ref={altchaRef}
                  challenge={JSON.stringify(captchaChallenge)}
                  configuration={JSON.stringify({ hideFooter: true, hideLogo: true })}
                />
              ) : (
                <div className={styles.captchaLoading}>Loading CAPTCHA...</div>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              disabled={!captchaSolution}
              className={styles.submitButton}
            >
              Sign in
            </Button>
          </form>

          <a href={getResetPasswordUrl()} className={styles.forgotLink}>
            Forgot password?
          </a>

          <div className={styles.divider} />
          <p className={styles.footer}>Secured by Keycloak</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import "altcha";
import "altcha/types/react";
import { useAuth } from "../auth/useAuth";
import { fetchCaptchaChallenge } from "../auth/keycloakTokenService";
import type { CaptchaChallenge } from "../auth/keycloakTokenService";
import { Button, Input, Alert } from "../components/ui";
import styles from "./LoginPage.module.css";

const loginSchema = z.object({
  username: z.string().min(1, i18next.t("auth:login.usernameRequired")),
  password: z.string().min(1, i18next.t("auth:login.passwordRequired")),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
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

    const handleStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.state === "verified" && detail?.payload) {
        setCaptchaSolution(detail.payload);
      } else if (detail?.state === "expired" || detail?.state === "error") {
        setCaptchaSolution(null);
      }
    };

    el.addEventListener("statechange", handleStateChange);

    return () => {
      el.removeEventListener("statechange", handleStateChange);
    };
  }, [captchaChallenge]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    if (!captchaSolution) {
      setAuthError(t("login.captchaRequired"));
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
          : t("common:errors.unexpectedError"),
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

          <h2 className={styles.heading}>{t("login.heading")}</h2>
          <p className={styles.subtitle}>{t("login.subtitle")}</p>

          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {authError && (
              <Alert variant="danger">{authError}</Alert>
            )}

            <Input
              label={t("login.usernameLabel")}
              placeholder={t("login.usernamePlaceholder")}
              autoComplete="username"
              leftIcon={<Mail size={18} />}
              error={errors.username?.message}
              {...register("username")}
            />

            <Input
              label={t("login.passwordLabel")}
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="current-password"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Altcha CAPTCHA Widget */}
            <div className={styles.captchaWrapper}>
              {captchaError ? (
                <div className={styles.captchaError}>
                  <p>{t("login.captchaFailed")}</p>
                  <button type="button" onClick={loadChallenge} className={styles.captchaRetry}>
                    {t("login.captchaRetry")}
                  </button>
                </div>
              ) : captchaChallenge ? (
                <altcha-widget
                  ref={altchaRef}
                  challenge={JSON.stringify(captchaChallenge)}
                  configuration={JSON.stringify({ hideFooter: true, hideLogo: true })}
                />
              ) : (
                <div className={styles.captchaLoading}>{t("login.captchaLoading")}</div>
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
              {t("login.submitButton")}
            </Button>
          </form>

          <Link to="/forgot-password" className={styles.forgotLink}>
            {t("login.forgotPasswordLink")}
          </Link>

          <div className={styles.divider} />
          <p className={styles.footer}>{t("footer")}</p>
        </div>
      </div>
    </div>
  );
}

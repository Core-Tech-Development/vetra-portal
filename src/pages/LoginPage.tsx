import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/useAuth";
import { Button, Input } from "../components/ui";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await loginWithCredentials(data.username, data.password);
      navigate("/", { replace: true });
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoPlaceholder}>
          <img src="/logo.png" alt="Vetra" className={styles.logoImg} />
        </div>

        <p className={styles.subtitle}>
          Veterinary diagnostic imaging platform
        </p>

        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {authError && (
            <div className={styles.errorBanner} role="alert">
              {authError}
            </div>
          )}

          <Input
            label="Username"
            placeholder="you@example.com"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            className={styles.submitButton}
          >
            Sign in
          </Button>
        </form>

        <div className={styles.divider} />
        <p className={styles.footer}>Secured by Keycloak</p>
      </div>
    </div>
  );
}

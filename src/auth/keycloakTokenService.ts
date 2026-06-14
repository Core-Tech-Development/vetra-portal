export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  session_state: string;
  scope: string;
}

interface AuthErrorResponse {
  error: string;
  message: string;
}

const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8180";
const KEYCLOAK_REALM =
  import.meta.env.VITE_KEYCLOAK_REALM ?? "vetra";
const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "vetra-web";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

function getTokenEndpoint(): string {
  return `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
}

export function getResetPasswordUrl(): string {
  const redirectUri = encodeURIComponent(window.location.origin + "/");
  return `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/login-actions/reset-credentials?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${redirectUri}`;
}

export async function refreshToken(
  storedRefreshToken: string,
): Promise<KeycloakTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: storedRefreshToken,
  });

  const response = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Token refresh failed.");
  }

  return response.json();
}

export interface CaptchaChallenge {
  algorithm: string;
  challenge: string;
  maxnumber: number;
  salt: string;
  signature: string;
}

export async function fetchCaptchaChallenge(): Promise<CaptchaChallenge> {
  const response = await fetch(`${API_BASE_URL}/auth/captcha-challenge`);
  if (!response.ok) {
    throw new Error("Failed to load CAPTCHA challenge.");
  }
  return response.json();
}

export async function loginWithCaptcha(
  username: string,
  password: string,
  captcha: string,
): Promise<KeycloakTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, captcha }),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(
        "Authentication server is unavailable. Please try again later.",
      );
    }

    if (errorData.error === "captcha_failed") {
      throw new Error("CAPTCHA verification failed. Please try again.");
    }

    if (errorData.error === "user_temporarily_disabled") {
      throw new Error(
        "Account temporarily locked due to too many failed attempts. Try again in 30 minutes.",
      );
    }

    if (errorData.error === "user_disabled") {
      throw new Error("Account is disabled. Contact your administrator.");
    }

    if (errorData.error === "invalid_grant") {
      throw new Error("Invalid username or password.");
    }

    if (errorData.error === "unauthorized_client") {
      throw new Error(
        "Login method is not enabled. Contact your administrator.",
      );
    }

    throw new Error(errorData.message || "Authentication failed.");
  }

  return response.json();
}

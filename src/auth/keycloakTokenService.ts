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

interface KeycloakTokenError {
  error: string;
  error_description: string;
}

const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8180";
const KEYCLOAK_REALM =
  import.meta.env.VITE_KEYCLOAK_REALM ?? "vetra";
const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "vetra-web";

function getTokenEndpoint(): string {
  return `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
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

export async function requestTokenWithPassword(
  username: string,
  password: string,
): Promise<KeycloakTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: KEYCLOAK_CLIENT_ID,
    username,
    password,
    scope: "openid",
  });

  const response = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    let errorData: KeycloakTokenError;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(
        "Authentication server is unavailable. Please try again later.",
      );
    }

    if (errorData.error === "invalid_grant") {
      throw new Error("Invalid username or password.");
    }

    if (errorData.error === "unauthorized_client") {
      throw new Error(
        "Login method is not enabled. Contact your administrator.",
      );
    }

    throw new Error(errorData.error_description || "Authentication failed.");
  }

  return response.json();
}

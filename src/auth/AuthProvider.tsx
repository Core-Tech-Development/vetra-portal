import { createContext, useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type Keycloak from "keycloak-js";
import type { KeycloakTokenParsed } from "keycloak-js";
import type { UserRole } from "./roles";
import keycloakInstance from "./keycloak";
import { requestTokenWithPassword, refreshToken } from "./keycloakTokenService";
import { Spinner } from "../components/ui/Spinner";

const TOKEN_STORAGE_KEY = "vetra_tokens";

export interface AuthUser {
  sub: string;
  name?: string;
  email?: string;
  preferredUsername?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser | null;
  roles: UserRole[];
  token: string | null;
  clinicStatus: string | null;
  keycloak: Keycloak;
  login: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_REFRESH_INTERVAL_MS = 30_000;
const TOKEN_MIN_VALIDITY_SECONDS = 60;

interface AuthProviderProps {
  children: ReactNode;
}

function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

function setKeycloakTokens(
  kc: Keycloak,
  accessToken: string,
  refreshToken: string,
  idToken: string,
): void {
  kc.authenticated = true;
  kc.token = accessToken;
  kc.tokenParsed = parseJwt(accessToken) as KeycloakTokenParsed;
  kc.refreshToken = refreshToken;
  kc.refreshTokenParsed = parseJwt(refreshToken) as KeycloakTokenParsed;
  kc.idToken = idToken;
  kc.idTokenParsed = parseJwt(idToken) as KeycloakTokenParsed;
  kc.subject = kc.tokenParsed.sub;
  kc.realmAccess = kc.tokenParsed.realm_access as
    | { roles: string[] }
    | undefined;
  kc.resourceAccess = kc.tokenParsed.resource_access as
    | Record<string, { roles: string[] }>
    | undefined;
  kc.sessionId = kc.tokenParsed.session_state as string | undefined;

  const iat = kc.tokenParsed.iat;
  if (iat) {
    kc.timeSkew = Math.floor(Date.now() / 1000) - iat;
  }
}

function saveTokensToStorage(
  accessToken: string,
  refreshTokenValue: string,
  idToken: string,
): void {
  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      id_token: idToken,
    }),
  );
}

function loadTokensFromStorage(): {
  access_token: string;
  refresh_token: string;
  id_token: string;
} | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

function clearTokensFromStorage(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

let initPromise: Promise<boolean> | null = null;

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [clinicStatus, setClinicStatus] = useState<string | null>(
    localStorage.getItem("vetra_clinic_status"),
  );
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateAuthState = useCallback(() => {
    const kc = keycloakInstance;
    setIsAuthenticated(!!kc.authenticated);
    setToken(kc.token ?? null);

    if (kc.authenticated && kc.tokenParsed) {
      const parsed = kc.tokenParsed;
      setUser({
        sub: (parsed.sub as string) ?? "",
        name: (parsed as Record<string, unknown>).name as string | undefined,
        email: (parsed as Record<string, unknown>).email as string | undefined,
        preferredUsername: (parsed as Record<string, unknown>)
          .preferred_username as string | undefined,
      });

      const realmRoles =
        (parsed.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
      setRoles(realmRoles as UserRole[]);

      // Auto-resolve clinic ID and status for clinic users
      const email = (parsed as Record<string, unknown>).email as string | undefined;
      if (email && realmRoles.some((r: string) => r === "CLINIC_ADMIN" || r === "CLINIC_STAFF")) {
        import("../api/clinics").then(({ findClinicByEmail }) => {
          findClinicByEmail(email)
            .then((clinic) => {
              localStorage.setItem("vetra_clinic_id", clinic.id);
              localStorage.setItem("vetra_clinic_status", clinic.status);
              setClinicStatus(clinic.status);
            })
            .catch(() => {
              // Clinic not found - ignore
            });
        });
      }

      // Auto-resolve specialist ID for specialist users
      if (realmRoles.some((r: string) => r === "SPECIALIST")) {
        if (!localStorage.getItem("vetra_specialist_id")) {
          import("../api/specialists").then(({ getMyProfile }) => {
            getMyProfile()
              .then((specialist) => {
                localStorage.setItem("vetra_specialist_id", specialist.id);
              })
              .catch(() => {
                // Specialist profile not found yet - ignore
              });
          });
        }
      }
    } else {
      setUser(null);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      // Try to restore session from stored tokens
      const storedTokens = loadTokensFromStorage();
      if (storedTokens) {
        try {
          const tokenResponse = await refreshToken(storedTokens.refresh_token);
          setKeycloakTokens(
            keycloakInstance,
            tokenResponse.access_token,
            tokenResponse.refresh_token,
            tokenResponse.id_token,
          );
          saveTokensToStorage(
            tokenResponse.access_token,
            tokenResponse.refresh_token,
            tokenResponse.id_token,
          );
          updateAuthState();
          setIsInitialized(true);
          return;
        } catch {
          // Refresh failed (token expired) — clear and fall through to login
          clearTokensFromStorage();
          localStorage.removeItem("vetra_clinic_id");
        }
      }

      // No stored tokens or refresh failed — try Keycloak SSO check
      if (!initPromise) {
        initPromise = keycloakInstance.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
          checkLoginIframe: false,
          silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html",
        });
      }

      try {
        const authenticated = await initPromise;
        if (authenticated) {
          updateAuthState();
        }
      } catch {
        // Keycloak init failed — proceed unauthenticated
      }
      setIsInitialized(true);
    }

    initAuth();
  }, [updateAuthState]);

  useEffect(() => {
    if (!isAuthenticated) return;

    refreshInterval.current = setInterval(() => {
      keycloakInstance
        .updateToken(TOKEN_MIN_VALIDITY_SECONDS)
        .then((refreshed) => {
          if (refreshed) {
            if (keycloakInstance.token && keycloakInstance.refreshToken && keycloakInstance.idToken) {
              saveTokensToStorage(
                keycloakInstance.token,
                keycloakInstance.refreshToken,
                keycloakInstance.idToken,
              );
            }
            updateAuthState();
          }
        })
        .catch(() => {
          clearTokensFromStorage();
          keycloakInstance.clearToken();
          updateAuthState();
        });
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [isAuthenticated, updateAuthState]);

  const login = useCallback(() => {
    keycloakInstance.login({ redirectUri: window.location.origin + "/" });
  }, []);

  const loginWithCredentials = useCallback(
    async (username: string, password: string): Promise<void> => {
      const tokenResponse = await requestTokenWithPassword(username, password);

      setKeycloakTokens(
        keycloakInstance,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.id_token,
      );

      saveTokensToStorage(
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.id_token,
      );

      localStorage.removeItem("vetra_clinic_id");
      localStorage.removeItem("vetra_clinic_status");
      localStorage.removeItem("vetra_specialist_id");
      setClinicStatus(null);
      updateAuthState();
    },
    [updateAuthState],
  );

  const logout = useCallback(() => {
    const idToken = keycloakInstance.idToken;
    clearTokensFromStorage();
    localStorage.removeItem("vetra_clinic_id");
    localStorage.removeItem("vetra_clinic_status");
    localStorage.removeItem("vetra_specialist_id");
    setClinicStatus(null);

    const redirectUri = window.location.origin + "/";

    try {
      keycloakInstance.logout({ redirectUri });
    } catch {
      // Keycloak adapter not initialized (direct login flow) — build logout URL manually
      const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8180";
      const realm = import.meta.env.VITE_KEYCLOAK_REALM ?? "vetra";
      const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "vetra-web";
      let logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}`;
      if (idToken) {
        logoutUrl += `&id_token_hint=${idToken}`;
      }
      window.location.href = logoutUrl;
    }
  }, []);

  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user,
        roles,
        token,
        clinicStatus,
        keycloak: keycloakInstance,
        login,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

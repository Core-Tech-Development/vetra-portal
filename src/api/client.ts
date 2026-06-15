import axios from "axios";
import type { AxiosError } from "axios";
import keycloak from "../auth/keycloak";
import type { ErrorResponse } from "./types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = keycloak.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vetra_tokens");
      localStorage.removeItem("vetra_clinic_id");
      localStorage.removeItem("vetra_clinic_status");
      localStorage.removeItem("vetra_specialist_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

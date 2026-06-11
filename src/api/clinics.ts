import apiClient from "./client";
import type { CreateClinicRequest, ClinicResponse, PageResponse } from "./types";

export async function createClinic(
  data: CreateClinicRequest
): Promise<ClinicResponse> {
  const response = await apiClient.post<ClinicResponse>("/clinics", data);
  return response.data;
}

export async function getClinic(id: string): Promise<ClinicResponse> {
  const response = await apiClient.get<ClinicResponse>(`/clinics/${id}`);
  return response.data;
}

export async function listClinics(
  page = 0,
  size = 20
): Promise<PageResponse<ClinicResponse>> {
  const response = await apiClient.get<PageResponse<ClinicResponse>>(
    "/clinics",
    { params: { page, size } }
  );
  return response.data;
}

export async function findClinicByEmail(email: string): Promise<ClinicResponse> {
  const response = await apiClient.get<ClinicResponse>(`/clinics/by-email`, {
    params: { email },
  });
  return response.data;
}

import apiClient from "./client";
import type { CreateClinicRequest, ClinicResponse, PageResponse, UpdateClinicProfileRequest } from "./types";

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

export async function getMyClinicProfile(): Promise<ClinicResponse> {
  const response = await apiClient.get<ClinicResponse>("/clinic/my-profile");
  return response.data;
}

export async function updateMyClinicProfile(data: UpdateClinicProfileRequest): Promise<ClinicResponse> {
  const response = await apiClient.put<ClinicResponse>("/clinic/my-profile", data);
  return response.data;
}

import apiClient from "./client";
import type {
  CreateLaudoRequest,
  UpdateLaudoRequest,
  LaudoResponse,
  PageResponse,
} from "./types";

export async function createLaudo(
  appointmentId: string,
  data: CreateLaudoRequest
): Promise<LaudoResponse> {
  const response = await apiClient.post<LaudoResponse>(
    `/appointments/${appointmentId}/laudos`,
    data
  );
  return response.data;
}

export async function getLaudo(id: string): Promise<LaudoResponse> {
  const response = await apiClient.get<LaudoResponse>(`/laudos/${id}`);
  return response.data;
}

export async function updateLaudo(
  id: string,
  data: UpdateLaudoRequest
): Promise<LaudoResponse> {
  const response = await apiClient.put<LaudoResponse>(
    `/laudos/${id}`,
    data
  );
  return response.data;
}

export async function issueLaudo(id: string): Promise<LaudoResponse> {
  const response = await apiClient.patch<LaudoResponse>(
    `/laudos/${id}/issue`
  );
  return response.data;
}

export async function listLaudosBySpecialist(
  specialistId: string,
  page = 0,
  size = 20
): Promise<PageResponse<LaudoResponse>> {
  const response = await apiClient.get<PageResponse<LaudoResponse>>(
    `/specialists/${specialistId}/laudos`,
    { params: { page, size } }
  );
  return response.data;
}

export async function deleteLaudo(id: string): Promise<void> {
  await apiClient.delete(`/laudos/${id}`);
}

export async function getLaudoByAppointment(
  appointmentId: string
): Promise<LaudoResponse> {
  const response = await apiClient.get<LaudoResponse>(
    `/appointments/${appointmentId}/laudos`
  );
  return response.data;
}

export async function generateLaudoPdf(
  laudoId: string
): Promise<LaudoResponse> {
  const response = await apiClient.post<LaudoResponse>(
    `/laudos/${laudoId}/generate-pdf`
  );
  return response.data;
}

export async function getLaudoPdfDownloadUrl(
  laudoId: string
): Promise<string> {
  const response = await apiClient.get<{ downloadUrl: string }>(
    `/laudos/${laudoId}/pdf-download-url`
  );
  return response.data.downloadUrl;
}

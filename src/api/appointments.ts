import apiClient from "./client";
import type {
  CreateAppointmentRequest,
  AppointmentResponse,
  PageResponse,
} from "./types";

export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  const response = await apiClient.post<AppointmentResponse>(
    "/appointments",
    data
  );
  return response.data;
}

export async function getAppointment(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.get<AppointmentResponse>(
    `/appointments/${id}`
  );
  return response.data;
}

export async function listAppointments(
  page = 0,
  size = 20,
  status?: string
): Promise<PageResponse<AppointmentResponse>> {
  const response = await apiClient.get<PageResponse<AppointmentResponse>>(
    "/appointments",
    { params: { page, size, status } }
  );
  return response.data;
}

export async function listAppointmentsBySpecialist(
  specialistId: string,
  page = 0,
  size = 20
): Promise<PageResponse<AppointmentResponse>> {
  const response = await apiClient.get<PageResponse<AppointmentResponse>>(
    `/specialists/${specialistId}/appointments`,
    { params: { page, size } }
  );
  return response.data;
}

export async function acceptAppointment(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/accept`
  );
  return response.data;
}

export async function startTransit(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/start-transit`
  );
  return response.data;
}

export async function startService(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/start-service`
  );
  return response.data;
}

export async function completeExam(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/complete-exam`
  );
  return response.data;
}

export async function completeAppointment(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/complete`
  );
  return response.data;
}

export async function noShowAppointment(
  id: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/no-show`
  );
  return response.data;
}

export async function declineAppointment(
  id: string,
  reason?: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/decline`,
    { reason: reason || "Declined by specialist" }
  );
  return response.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiClient.delete(`/appointments/${id}`);
}

export async function cancelAppointment(
  id: string,
  reason: string
): Promise<AppointmentResponse> {
  const response = await apiClient.patch<AppointmentResponse>(
    `/appointments/${id}/cancel`,
    { reason }
  );
  return response.data;
}

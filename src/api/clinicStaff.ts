import apiClient from "./client";
import type {
  CreateClinicStaffRequest,
  UpdateClinicStaffRequest,
  UpdateMyStaffProfileRequest,
  ClinicStaffResponse,
  PageResponse,
} from "./types";

export async function createClinicStaff(
  clinicId: string,
  data: CreateClinicStaffRequest
): Promise<ClinicStaffResponse> {
  const response = await apiClient.post<ClinicStaffResponse>(
    `/clinics/${clinicId}/staff`,
    data
  );
  return response.data;
}

export async function listClinicStaff(
  clinicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ClinicStaffResponse>> {
  const response = await apiClient.get<PageResponse<ClinicStaffResponse>>(
    `/clinics/${clinicId}/staff`,
    { params: { page, size } }
  );
  return response.data;
}

export async function getClinicStaff(id: string): Promise<ClinicStaffResponse> {
  const response = await apiClient.get<ClinicStaffResponse>(`/staff/${id}`);
  return response.data;
}

export async function updateClinicStaff(
  id: string,
  data: UpdateClinicStaffRequest
): Promise<ClinicStaffResponse> {
  const response = await apiClient.put<ClinicStaffResponse>(`/staff/${id}`, data);
  return response.data;
}

export async function deactivateClinicStaff(id: string): Promise<ClinicStaffResponse> {
  const response = await apiClient.delete<ClinicStaffResponse>(`/staff/${id}`);
  return response.data;
}

export async function getMyStaffProfile(): Promise<ClinicStaffResponse> {
  const response = await apiClient.get<ClinicStaffResponse>("/staff/my-profile");
  return response.data;
}

export async function updateMyStaffProfile(data: UpdateMyStaffProfileRequest): Promise<ClinicStaffResponse> {
  const response = await apiClient.put<ClinicStaffResponse>("/staff/my-profile", data);
  return response.data;
}

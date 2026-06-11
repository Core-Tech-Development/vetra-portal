import apiClient from "./client";
import type {
  AdminDashboardResponse,
  ClinicResponse,
  AuditLogResponse,
  PageResponse,
} from "./types";

export async function getDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get<AdminDashboardResponse>(
    "/admin/dashboard"
  );
  return response.data;
}

export async function approveClinic(id: string): Promise<ClinicResponse> {
  const response = await apiClient.patch<ClinicResponse>(
    `/admin/clinics/${id}/approve`
  );
  return response.data;
}

export async function suspendClinic(id: string): Promise<ClinicResponse> {
  const response = await apiClient.patch<ClinicResponse>(
    `/admin/clinics/${id}/suspend`
  );
  return response.data;
}

export async function listAuditLogs(
  page = 0,
  size = 20,
  entityType?: string,
  entityId?: string
): Promise<PageResponse<AuditLogResponse>> {
  const response = await apiClient.get<PageResponse<AuditLogResponse>>(
    "/admin/audit-logs",
    { params: { page, size, entityType, entityId } }
  );
  return response.data;
}

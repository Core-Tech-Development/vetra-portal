import apiClient from "./client";
import type {
  ExamTypePricingResponse,
  CreateExamTypePricingRequest,
  UpdateExamTypePricingRequest,
  BillingRecordResponse,
  BillingDashboardResponse,
  PageResponse,
} from "./types";

// === Pricing (Admin) ===

export async function listExamTypePricings(): Promise<ExamTypePricingResponse[]> {
  const response = await apiClient.get<ExamTypePricingResponse[]>(
    "/admin/pricing/exam-types"
  );
  return response.data;
}

export async function createExamTypePricing(
  data: CreateExamTypePricingRequest
): Promise<ExamTypePricingResponse> {
  const response = await apiClient.post<ExamTypePricingResponse>(
    "/admin/pricing/exam-types",
    data
  );
  return response.data;
}

export async function updateExamTypePricing(
  id: string,
  data: UpdateExamTypePricingRequest
): Promise<ExamTypePricingResponse> {
  const response = await apiClient.put<ExamTypePricingResponse>(
    `/admin/pricing/exam-types/${id}`,
    data
  );
  return response.data;
}

// === Billing Admin ===

export async function getBillingDashboard(): Promise<BillingDashboardResponse> {
  const response = await apiClient.get<BillingDashboardResponse>(
    "/admin/billing/dashboard"
  );
  return response.data;
}

export async function listBillingRecords(
  page = 0,
  size = 20
): Promise<PageResponse<BillingRecordResponse>> {
  const response = await apiClient.get<PageResponse<BillingRecordResponse>>(
    "/admin/billing/records",
    { params: { page, size } }
  );
  return response.data;
}

export async function getBillingRecord(
  id: string
): Promise<BillingRecordResponse> {
  const response = await apiClient.get<BillingRecordResponse>(
    `/admin/billing/records/${id}`
  );
  return response.data;
}

// === Billing (Clinic) ===

export async function listClinicBillingRecords(
  clinicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<BillingRecordResponse>> {
  const response = await apiClient.get<PageResponse<BillingRecordResponse>>(
    "/billing/records",
    { params: { clinicId, page, size } }
  );
  return response.data;
}

export async function getClinicBillingRecord(
  id: string
): Promise<BillingRecordResponse> {
  const response = await apiClient.get<BillingRecordResponse>(
    `/billing/records/${id}`
  );
  return response.data;
}

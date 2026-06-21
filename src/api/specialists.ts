import apiClient from "./client";
import type {
  CreateSpecialistRequest,
  UpdateSpecialistRequest,
  UpdateMyProfileRequest,
  SpecialistResponse,
  AddCoverageAreaRequest,
  CoverageAreaResponse,
  CreateSpecialistPricingRequest,
  SpecialistPricingResponse,
  PageResponse,
} from "./types";

export async function createSpecialist(
  data: CreateSpecialistRequest
): Promise<SpecialistResponse> {
  const response = await apiClient.post<SpecialistResponse>(
    "/specialists",
    data
  );
  return response.data;
}

export async function getSpecialist(id: string): Promise<SpecialistResponse> {
  const response = await apiClient.get<SpecialistResponse>(
    `/specialists/${id}`
  );
  return response.data;
}

export async function listSpecialists(
  page = 0,
  size = 20
): Promise<PageResponse<SpecialistResponse>> {
  const response = await apiClient.get<PageResponse<SpecialistResponse>>(
    "/specialists",
    { params: { page, size } }
  );
  return response.data;
}

export async function updateSpecialist(
  id: string,
  data: UpdateSpecialistRequest
): Promise<SpecialistResponse> {
  const response = await apiClient.put<SpecialistResponse>(
    `/specialists/${id}`,
    data
  );
  return response.data;
}

export async function approveSpecialist(
  id: string
): Promise<SpecialistResponse> {
  const response = await apiClient.patch<SpecialistResponse>(
    `/specialists/${id}/approve`
  );
  return response.data;
}

export async function searchSpecialists(
  city: string,
  state: string,
  specialty?: string
): Promise<SpecialistResponse[]> {
  const response = await apiClient.get<SpecialistResponse[]>(
    "/specialists/search",
    { params: { city, state, specialty } }
  );
  return response.data;
}

export async function addCoverageArea(
  specialistId: string,
  data: AddCoverageAreaRequest
): Promise<CoverageAreaResponse> {
  const response = await apiClient.post<CoverageAreaResponse>(
    `/specialists/${specialistId}/coverage-areas`,
    data
  );
  return response.data;
}

export async function listCoverageAreas(
  specialistId: string
): Promise<CoverageAreaResponse[]> {
  const response = await apiClient.get<CoverageAreaResponse[]>(
    `/specialists/${specialistId}/coverage-areas`
  );
  return response.data;
}

export async function removeCoverageArea(
  specialistId: string,
  areaId: string
): Promise<void> {
  await apiClient.delete(
    `/specialists/${specialistId}/coverage-areas/${areaId}`
  );
}

// --- Specialist self-service profile ---

export async function getMyProfile(): Promise<SpecialistResponse> {
  const response = await apiClient.get<SpecialistResponse>("/specialist/profile");
  return response.data;
}

export async function updateMyProfile(data: UpdateMyProfileRequest): Promise<SpecialistResponse> {
  const response = await apiClient.put<SpecialistResponse>("/specialist/profile", data);
  return response.data;
}

export async function getMyCoverageAreas(): Promise<CoverageAreaResponse[]> {
  const response = await apiClient.get<CoverageAreaResponse[]>("/specialist/profile/coverage-areas");
  return response.data;
}

export async function addMyCoverageArea(data: AddCoverageAreaRequest): Promise<CoverageAreaResponse> {
  const response = await apiClient.post<CoverageAreaResponse>("/specialist/profile/coverage-areas", data);
  return response.data;
}

export async function toggleMyCoverageArea(areaId: string): Promise<CoverageAreaResponse> {
  const response = await apiClient.patch<CoverageAreaResponse>(`/specialist/profile/coverage-areas/${areaId}/toggle`);
  return response.data;
}

export async function removeMyCoverageArea(areaId: string): Promise<void> {
  await apiClient.delete(`/specialist/profile/coverage-areas/${areaId}`);
}

// --- Specialist self-service pricing ---

export async function getMyPricing(): Promise<SpecialistPricingResponse[]> {
  const response = await apiClient.get<SpecialistPricingResponse[]>("/specialist/profile/pricing");
  return response.data;
}

export async function upsertMyPricing(data: CreateSpecialistPricingRequest): Promise<SpecialistPricingResponse> {
  const response = await apiClient.put<SpecialistPricingResponse>("/specialist/profile/pricing", data);
  return response.data;
}

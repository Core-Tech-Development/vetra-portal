import apiClient from "./client";
import type {
  CreateTutorRequest,
  TutorResponse,
  PageResponse,
} from "./types";

export async function createTutor(
  clinicId: string,
  data: CreateTutorRequest
): Promise<TutorResponse> {
  const response = await apiClient.post<TutorResponse>(
    `/clinics/${clinicId}/tutors`,
    data
  );
  return response.data;
}

export async function listTutorsByClinic(
  clinicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<TutorResponse>> {
  const response = await apiClient.get<PageResponse<TutorResponse>>(
    `/clinics/${clinicId}/tutors`,
    { params: { page, size } }
  );
  return response.data;
}

export async function getTutor(id: string): Promise<TutorResponse> {
  const response = await apiClient.get<TutorResponse>(`/tutors/${id}`);
  return response.data;
}

export async function updateTutor(
  id: string,
  data: CreateTutorRequest
): Promise<TutorResponse> {
  const response = await apiClient.put<TutorResponse>(`/tutors/${id}`, data);
  return response.data;
}

export async function deleteTutor(id: string): Promise<void> {
  await apiClient.delete(`/tutors/${id}`);
}

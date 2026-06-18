import apiClient from "./client";
import type {
  CreateExamRequestRequest,
  ExamRequestResponse,
  PageResponse,
} from "./types";

export async function createExamRequest(
  clinicId: string,
  data: CreateExamRequestRequest
): Promise<ExamRequestResponse> {
  const response = await apiClient.post<ExamRequestResponse>(
    `/clinics/${clinicId}/exam-requests`,
    data
  );
  return response.data;
}

export async function listExamRequestsByClinic(
  clinicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ExamRequestResponse>> {
  const response = await apiClient.get<PageResponse<ExamRequestResponse>>(
    `/clinics/${clinicId}/exam-requests`,
    { params: { page, size } }
  );
  return response.data;
}

export async function getExamRequest(
  id: string
): Promise<ExamRequestResponse> {
  const response = await apiClient.get<ExamRequestResponse>(
    `/exam-requests/${id}`
  );
  return response.data;
}

export async function updateExamRequest(
  id: string,
  data: CreateExamRequestRequest
): Promise<ExamRequestResponse> {
  const response = await apiClient.put<ExamRequestResponse>(
    `/exam-requests/${id}`,
    data
  );
  return response.data;
}

export async function cancelExamRequest(
  id: string
): Promise<ExamRequestResponse> {
  const response = await apiClient.patch<ExamRequestResponse>(
    `/exam-requests/${id}/cancel`
  );
  return response.data;
}

export async function deleteExamRequest(id: string): Promise<void> {
  await apiClient.delete(`/exam-requests/${id}`);
}

export async function listExamRequestsByPatient(
  patientId: string
): Promise<ExamRequestResponse[]> {
  const response = await apiClient.get<ExamRequestResponse[]>(
    `/patients/${patientId}/exam-requests`
  );
  return response.data;
}

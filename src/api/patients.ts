import apiClient from "./client";
import type {
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientResponse,
  PageResponse,
} from "./types";

export async function createPatient(
  clinicId: string,
  tutorId: string,
  data: CreatePatientRequest
): Promise<PatientResponse> {
  const response = await apiClient.post<PatientResponse>(
    `/clinics/${clinicId}/tutors/${tutorId}/patients`,
    data
  );
  return response.data;
}

export async function listPatientsByClinic(
  clinicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<PatientResponse>> {
  const response = await apiClient.get<PageResponse<PatientResponse>>(
    `/clinics/${clinicId}/patients`,
    { params: { page, size } }
  );
  return response.data;
}

export async function listPatientsByTutor(
  tutorId: string,
  page = 0,
  size = 20
): Promise<PageResponse<PatientResponse>> {
  const response = await apiClient.get<PageResponse<PatientResponse>>(
    `/tutors/${tutorId}/patients`,
    { params: { page, size } }
  );
  return response.data;
}

export async function getPatient(id: string): Promise<PatientResponse> {
  const response = await apiClient.get<PatientResponse>(`/patients/${id}`);
  return response.data;
}

export async function updatePatient(
  id: string,
  data: UpdatePatientRequest
): Promise<PatientResponse> {
  const response = await apiClient.put<PatientResponse>(
    `/patients/${id}`,
    data
  );
  return response.data;
}

export async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/patients/${id}`);
}

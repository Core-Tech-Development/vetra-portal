import apiClient from "./client";
import type { ExamFileResponse } from "./types";

export async function uploadFile(
  appointmentId: string,
  file: File
): Promise<ExamFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ExamFileResponse>(
    `/appointments/${appointmentId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function listFiles(
  appointmentId: string
): Promise<ExamFileResponse[]> {
  const response = await apiClient.get<ExamFileResponse[]>(
    `/appointments/${appointmentId}/files`
  );
  return response.data;
}

export async function getDownloadUrl(fileId: string): Promise<string> {
  const response = await apiClient.get<ExamFileResponse>(
    `/files/${fileId}/download-url`
  );
  return response.data.downloadUrl ?? "";
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiClient.delete(`/files/${fileId}`);
}

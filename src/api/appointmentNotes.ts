import apiClient from "./client";
import type { AppointmentNoteResponse } from "./types";

export async function createNote(
  appointmentId: string,
  title: string,
  content: string,
): Promise<AppointmentNoteResponse> {
  const res = await apiClient.post(
    `/api/v1/appointments/${appointmentId}/notes`,
    { title, content },
  );
  return res.data;
}

export async function listNotes(
  appointmentId: string,
): Promise<AppointmentNoteResponse[]> {
  const res = await apiClient.get(
    `/api/v1/appointments/${appointmentId}/notes`,
  );
  return res.data;
}

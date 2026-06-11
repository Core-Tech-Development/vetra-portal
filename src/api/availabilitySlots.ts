import apiClient from "./client";
import type {
  CreateSlotRequest,
  SlotResponse,
  PageResponse,
} from "./types";

export async function createSlot(
  specialistId: string,
  data: CreateSlotRequest
): Promise<SlotResponse> {
  const response = await apiClient.post<SlotResponse>(
    `/specialists/${specialistId}/availability-slots`,
    data
  );
  return response.data;
}

export async function listSlots(
  specialistId: string,
  page = 0,
  size = 20
): Promise<PageResponse<SlotResponse>> {
  const response = await apiClient.get<PageResponse<SlotResponse>>(
    `/specialists/${specialistId}/availability-slots`,
    { params: { page, size } }
  );
  return response.data;
}

export async function deleteSlot(id: string): Promise<void> {
  await apiClient.delete(`/availability-slots/${id}`);
}

export async function blockSlot(id: string): Promise<SlotResponse> {
  const response = await apiClient.patch<SlotResponse>(
    `/availability-slots/${id}/block`
  );
  return response.data;
}

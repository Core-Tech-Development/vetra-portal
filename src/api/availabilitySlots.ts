import apiClient from "./client";
import type {
  CreateSlotRequest,
  CreateBulkSlotsRequest,
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

export async function listSlotsByDateRange(
  specialistId: string,
  from: string,
  to: string
): Promise<SlotResponse[]> {
  const response = await apiClient.get<SlotResponse[]>(
    `/specialists/${specialistId}/availability-slots/calendar`,
    { params: { from, to } }
  );
  return response.data;
}

export async function createBulkSlots(
  specialistId: string,
  data: CreateBulkSlotsRequest
): Promise<SlotResponse[]> {
  const response = await apiClient.post<SlotResponse[]>(
    `/specialists/${specialistId}/availability-slots/bulk`,
    data
  );
  return response.data;
}

export async function listAvailableSlots(
  specialistId: string,
  from: string,
  to: string
): Promise<SlotResponse[]> {
  const response = await apiClient.get<SlotResponse[]>(
    `/specialists/${specialistId}/available-slots`,
    { params: { from, to } }
  );
  return response.data;
}

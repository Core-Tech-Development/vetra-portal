import apiClient from "./client";
import type { NotificationResponse, PageResponse } from "./types";

export async function listNotifications(
  page = 0,
  size = 20
): Promise<PageResponse<NotificationResponse>> {
  const response = await apiClient.get<PageResponse<NotificationResponse>>(
    "/notifications",
    { params: { page, size } }
  );
  return response.data;
}

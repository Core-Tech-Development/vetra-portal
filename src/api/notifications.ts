import apiClient from "./client";
import type { NotificationResponse, PageResponse } from "./types";

export async function listNotifications(
  page = 0,
  size = 20,
  unreadOnly = false
): Promise<PageResponse<NotificationResponse>> {
  const response = await apiClient.get<PageResponse<NotificationResponse>>(
    "/notifications",
    { params: { page, size, unreadOnly } }
  );
  return response.data;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post("/notifications/mark-all-read");
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
  return response.data.count;
}

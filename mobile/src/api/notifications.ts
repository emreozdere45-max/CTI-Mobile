import { API_BASE_URL } from "../config/api";
import type { Notification } from "../types/api";

type NotificationsResponse = {
  data: Notification[];
  meta: {
    total: number;
    unread_count: number;
  };
};

type NotificationResponse = {
  data: Notification;
};

export async function listNotifications(
  accessToken: string,
  unreadOnly = false,
): Promise<NotificationsResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications?unread_only=${unreadOnly}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Notifications could not be loaded.";
    throw new Error(message);
  }

  return response.json();
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: string,
): Promise<NotificationResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Notification could not be marked as read.";
    throw new Error(message);
  }

  return response.json();
}

export async function markAllNotificationsRead(accessToken: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Notifications could not be marked as read.";
    throw new Error(message);
  }

  const body = (await response.json()) as { data: { updated_count: number } };
  return body.data.updated_count;
}

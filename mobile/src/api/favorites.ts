import { API_BASE_URL } from "../config/api";
import type { Favorite, FavoriteTargetType } from "../types/api";

type FavoriteResponse = {
  data: Favorite;
};

type FavoriteListResponse = {
  data: Favorite[];
  meta: {
    total: number;
  };
};

export async function listFavorites(
  accessToken: string,
  targetType?: FavoriteTargetType,
): Promise<FavoriteListResponse> {
  const query = targetType ? `?target_type=${targetType}` : "";
  const response = await fetch(`${API_BASE_URL}/favorites${query}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Favorites could not be loaded.";
    throw new Error(message);
  }

  return response.json();
}

export async function createFavorite(
  accessToken: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<FavoriteResponse> {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_type: targetType,
      target_id: targetId,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Favorite could not be created.";
    throw new Error(message);
  }

  return response.json();
}

export async function deleteFavorite(accessToken: string, favoriteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Favorite could not be deleted.";
    throw new Error(message);
  }
}

import { API_BASE_URL } from "../config/api";
import type { Threat } from "../types/api";

type ThreatsResponse = {
  data: Threat[];
  meta: {
    total: number;
  };
};

export async function listThreats(accessToken: string): Promise<ThreatsResponse> {
  const response = await fetch(`${API_BASE_URL}/threats`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Threats could not be loaded.";
    throw new Error(message);
  }

  return response.json();
}

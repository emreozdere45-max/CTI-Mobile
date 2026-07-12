import { API_BASE_URL } from "../config/api";
import type { IocSearchData } from "../types/api";

type IocSearchResponse = {
  data: IocSearchData;
};

export async function searchIocs(
  accessToken: string,
  value: string,
  type?: string,
): Promise<IocSearchResponse> {
  const params = new URLSearchParams({ value });
  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`${API_BASE_URL}/iocs/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "IOC search could not be completed.";
    throw new Error(message);
  }

  return response.json();
}

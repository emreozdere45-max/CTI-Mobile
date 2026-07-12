import { API_BASE_URL } from "../config/api";
import type { Threat, ThreatCreatePayload, ThreatDetail } from "../types/api";

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

type ThreatDetailResponse = {
  data: ThreatDetail;
};

export async function getThreatDetail(
  accessToken: string,
  threatId: string,
): Promise<ThreatDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/threats/${threatId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Threat detail could not be loaded.";
    throw new Error(message);
  }

  return response.json();
}

type CreateThreatResponse = {
  data: ThreatDetail;
};

export async function createThreat(
  accessToken: string,
  payload: ThreatCreatePayload,
): Promise<CreateThreatResponse> {
  const response = await fetch(`${API_BASE_URL}/threats`, {
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = formatApiError(errorBody?.detail, "Threat could not be created.");
    throw new Error(typeof message === "string" ? message : "Threat could not be created.");
  }

  return response.json();
}

function formatApiError(detail: unknown, fallback: string): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item?.msg === "string") {
          return item.msg;
        }
        return null;
      })
      .filter(Boolean)
      .join(" ");
    return messages || fallback;
  }

  return fallback;
}

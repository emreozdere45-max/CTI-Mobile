import { API_BASE_URL } from "../config/api";
import type { ThreatAiSummary } from "../types/api";

type ThreatAiSummaryResponse = {
  data: ThreatAiSummary;
};

export async function createThreatSummary(
  accessToken: string,
  threatId: string,
): Promise<ThreatAiSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/threat-summary`, {
    body: JSON.stringify({
      summary_type: "analyst_brief",
      threat_id: threatId,
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "AI summary could not be generated.";
    throw new Error(typeof message === "string" ? message : "AI summary could not be generated.");
  }

  return response.json();
}

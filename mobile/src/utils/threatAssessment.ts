import type { ThreatCreatePayload } from "../types/api";

type Severity = ThreatCreatePayload["severity"];

const highRiskKeywords = [
  "ransomware",
  "credential",
  "malware",
  "phishing",
  "breach",
  "exploit",
  "critical",
  "admin",
  "finance",
  "bank",
  "payment",
  "invoice",
];

const mediumRiskKeywords = ["suspicious", "domain", "login", "email", "ip", "url", "campaign"];

export function assessThreatRisk({
  description,
  summary,
  tags,
  title,
}: {
  description: string;
  summary: string;
  tags: string;
  title: string;
}): { confidenceScore: number; severity: Severity } {
  const text = `${title} ${summary} ${description} ${tags}`.toLowerCase();
  const highMatches = highRiskKeywords.filter((keyword) => text.includes(keyword)).length;
  const mediumMatches = mediumRiskKeywords.filter((keyword) => text.includes(keyword)).length;
  const detailBonus = description.trim().length > 140 ? 8 : description.trim().length > 60 ? 4 : 0;
  const score = Math.min(96, 45 + highMatches * 9 + mediumMatches * 5 + detailBonus);

  if (score >= 85 || highMatches >= 4) {
    return { confidenceScore: score, severity: "critical" };
  }

  if (score >= 70 || highMatches >= 2) {
    return { confidenceScore: score, severity: "high" };
  }

  if (score >= 55 || mediumMatches >= 2) {
    return { confidenceScore: score, severity: "medium" };
  }

  return { confidenceScore: Math.max(score, 35), severity: "low" };
}

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
};

export type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type Threat = {
  id: string;
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "low" | "info" | string;
  confidence_score: number;
  source?: {
    id: string;
    name: string;
  };
  tags: string[];
  published_at: string;
  is_favorite: boolean;
};

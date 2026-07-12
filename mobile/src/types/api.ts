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

export type ThreatIOC = {
  id: string;
  type: string;
  value: string;
  risk_score: number;
};

export type ThreatDetail = Threat & {
  description: string;
  iocs: ThreatIOC[];
  recommended_actions: string[];
};

export type FavoriteTargetType = "threat" | "ioc";

export type Favorite = {
  id: string;
  target_type: FavoriteTargetType;
  target_id: string;
  target: Partial<Threat> & Record<string, unknown>;
  created_at: string;
};

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

export type ThreatCreatePayload = {
  title: string;
  summary: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  confidence_score: number;
  industry: string | null;
  region: string | null;
  tags: string[];
  source_id: string | null;
  published_at: string | null;
};

export type ThreatUpdatePayload = Partial<ThreatCreatePayload>;

export type ThreatIOC = {
  id: string;
  type: string;
  value: string;
  risk_score: number;
};

export type ThreatDetail = Threat & {
  description: string;
  industry: string | null;
  region: string | null;
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

export type Notification = {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low" | "info" | string;
  target_type: string | null;
  target_id: string | null;
  target_threat_id?: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type IocSearchResult = {
  id: string;
  type: string;
  value: string;
  risk_score: number;
  confidence_score: number;
  related_threat_count: number;
  related_threats?: Threat[];
};

export type IocSearchData = {
  query: string;
  detected_type: string;
  results: IocSearchResult[];
};

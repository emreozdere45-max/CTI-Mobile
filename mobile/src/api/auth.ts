import { API_BASE_URL } from "../config/api";
import type { AuthSession } from "../types/api";

type LoginResponse = {
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      full_name: string;
      roles: string[];
    };
  };
};

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? "Login failed. Check email and password.";
    throw new Error(message);
  }

  const body = (await response.json()) as LoginResponse;
  return {
    accessToken: body.data.access_token,
    tokenType: body.data.token_type,
    expiresIn: body.data.expires_in,
    user: body.data.user,
  };
}

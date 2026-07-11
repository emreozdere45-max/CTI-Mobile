import { API_BASE_URL } from "../config/api";

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

export async function login(email: string, password: string): Promise<LoginResponse> {
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

  return response.json();
}

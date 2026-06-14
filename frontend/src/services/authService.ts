import { apiClient, authHeaders, setAuthToken } from "./apiClient";

interface AuthResponse {
  username: string;
  token: string;
}

export const register = async (username: string, password: string) => {
  const response = await apiClient.post<AuthResponse>("/auth/register", { username, password });
  setAuthToken(response.token);
  return response;
};

export const login = async (username: string, password: string) => {
  const response = await apiClient.post<AuthResponse>("/auth/login", { username, password });
  setAuthToken(response.token);
  return response;
};

export const logout = () => {
  setAuthToken(null);
};

export const fetchCurrentUser = async () => {
  return apiClient.get<{ username: string }>("/auth/me");
};

export const authRequest = async <T>(
  path: string,
  method: string,
  body?: Record<string, unknown> | null,
) => {
  const headers = { ...authHeaders() };
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "/api"}${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );

  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new Error(responseBody.message || "API request failed");
  }

  return (await response.json()) as T;
};

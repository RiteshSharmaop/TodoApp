const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

interface RequestOptions extends RequestInit {
  body?: Record<string, unknown> | null;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    const error = new Error(responseBody.message || "API request failed");
    throw error;
  }

  return (await response.json()) as T;
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: Record<string, unknown> | null) =>
    request<T>(path, { method: "POST", body }),
};

export const getAuthToken = (): string | null => {
  return window.localStorage.getItem("todo_auth_token");
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    window.localStorage.setItem("todo_auth_token", token);
  } else {
    window.localStorage.removeItem("todo_auth_token");
  }
};

export const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

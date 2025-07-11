const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const token = localStorage.getItem("token");

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(BASE_URL + url, options);

  if (response.status === 401) {
    localStorage.removeItem("token");
    if (!window.location.pathname.startsWith("/signin")) {
      window.location.href = "/signin";
    }
    throw new Error("Session expired or unauthorized. Please sign in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
}

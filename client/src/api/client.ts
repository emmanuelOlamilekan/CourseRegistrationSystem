import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach JWT on every request — read from Zustand's persisted store key
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const { state } = JSON.parse(raw) as { state: { token?: string } };
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Normalise errors + redirect on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("auth:logout"));
    }
    const message =
      error.response?.data?.message ?? error.message ?? "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

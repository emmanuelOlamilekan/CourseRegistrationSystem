import { apiClient } from "./client";
import type { ApiResponse, AuthTokens } from "@/types";

export interface RegisterPayload {
  email: string;
  password: string;
  role?: "student" | "lecturer" | "admin";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResult {
  _id: string;
  email: string;
  role: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<ApiResponse<RegisterResult>>("/auth/register", payload)
      .then((r) => r.data.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<AuthTokens>>("/auth/login", payload)
      .then((r) => r.data.data),
};

import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, User, UserRole } from "@/types";

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facultyId?: string;
  departmentId?: string;
  matricNumber?: string;
  staffId?: string;
  isLevelAdvisor?: boolean;
  levelAdvising?: number[];
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  facultyId?: string;
  departmentId?: string;
  matricNumber?: string;
  staffId?: string;
  isLevelAdvisor?: boolean;
  levelAdvising?: number[];
}

export interface AdminUpdatePayload extends UpdateProfilePayload {
  isActive?: boolean;
}

export const usersApi = {
  getMe: () =>
    apiClient.get<ApiResponse<User>>("/users/me").then((r) => r.data.data),

  updateMe: (payload: UpdateProfilePayload) =>
    apiClient
      .patch<ApiResponse<User>>("/users/me", payload)
      .then((r) => r.data.data),

  getByFaculty: (facultyId: string) =>
    apiClient
      .get<ApiResponse<User[]>>(`/users/faculty/${facultyId}`)
      .then((r) => r.data.data),

  getByDepartment: (departmentId: string) =>
    apiClient
      .get<ApiResponse<User[]>>(`/users/department/${departmentId}`)
      .then((r) => r.data.data),

  // Admin
  getAll: () =>
    apiClient
      .get<PaginatedResponse<User>>("/users")
      .then((r) => ({ users: r.data.data, total: r.data.total })),

  create: (payload: CreateUserPayload) =>
    apiClient.post<ApiResponse<User>>("/users", payload).then((r) => r.data.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data.data),

  updateById: (id: string, payload: AdminUpdatePayload) =>
    apiClient
      .patch<ApiResponse<User>>(`/users/${id}`, payload)
      .then((r) => r.data.data),

  deactivate: (id: string) => apiClient.delete(`/users/${id}`),
};

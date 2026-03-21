import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Course, Faculty, Department } from "@/types";

export interface CourseFilters {
  departmentId?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreateCoursePayload {
  title: string;
  code: string;
  description?: string;
  lecturerId: string;
  departmentId: string;
  capacity?: number;
}

export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export const coursesApi = {
  // Faculties (public)
  getFaculties: () =>
    apiClient.get<ApiResponse<Faculty[]>>("/faculties").then((r) => r.data.data),

  getFacultyById: (id: string) =>
    apiClient.get<ApiResponse<Faculty>>(`/faculties/${id}`).then((r) => r.data.data),

  createFaculty: (name: string) =>
    apiClient
      .post<ApiResponse<Faculty>>("/faculties", { name })
      .then((r) => r.data.data),

  updateFaculty: (id: string, name: string) =>
    apiClient
      .patch<ApiResponse<Faculty>>(`/faculties/${id}`, { name })
      .then((r) => r.data.data),

  deleteFaculty: (id: string) => apiClient.delete(`/faculties/${id}`),

  // Departments (public)
  getDepartments: () =>
    apiClient
      .get<ApiResponse<Department[]>>("/departments")
      .then((r) => r.data.data),

  getDepartmentById: (id: string) =>
    apiClient
      .get<ApiResponse<Department>>(`/departments/${id}`)
      .then((r) => r.data.data),

  getDepartmentsByFaculty: (facultyId: string) =>
    apiClient
      .get<ApiResponse<Department[]>>(`/departments/faculty/${facultyId}`)
      .then((r) => r.data.data),

  createDepartment: (payload: { name: string; facultyId: string }) =>
    apiClient
      .post<ApiResponse<Department>>("/departments", payload)
      .then((r) => r.data.data),

  updateDepartment: (id: string, payload: { name?: string; isActive?: boolean }) =>
    apiClient
      .patch<ApiResponse<Department>>(`/departments/${id}`, payload)
      .then((r) => r.data.data),

  deleteDepartment: (id: string) => apiClient.delete(`/departments/${id}`),

  // Courses (public reads)
  getCourses: (filters?: CourseFilters) =>
    apiClient
      .get<{ success: boolean; courses: Course[]; total: number }>("/courses", {
        params: filters,
      })
      .then((r) => ({ courses: r.data.courses, total: r.data.total })),

  getCourseById: (id: string) =>
    apiClient.get<ApiResponse<Course>>(`/courses/${id}`).then((r) => r.data.data),

  getCourseByCode: (code: string) =>
    apiClient
      .get<ApiResponse<Course>>(`/courses/code/${code}`)
      .then((r) => r.data.data),

  getCoursesByDepartment: (departmentId: string) =>
    apiClient
      .get<PaginatedResponse<Course>>(`/courses/department/${departmentId}`)
      .then((r) => r.data.data),

  createCourse: (payload: CreateCoursePayload) =>
    apiClient
      .post<ApiResponse<Course>>("/courses", payload)
      .then((r) => r.data.data),

  updateCourse: (id: string, payload: UpdateCoursePayload) =>
    apiClient
      .patch<ApiResponse<Course>>(`/courses/${id}`, payload)
      .then((r) => r.data.data),

  deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`),
};

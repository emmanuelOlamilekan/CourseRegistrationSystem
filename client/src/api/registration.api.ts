import { apiClient } from "./client";
import type { ApiResponse, Registration, RegistrationStatus } from "@/types";

export const registrationApi = {
  enroll: (courseId: string, programId: string) =>
    apiClient
      .post<ApiResponse<Registration>>("/registrations/enroll", { courseId, programId })
      .then((r) => r.data.data),

  drop: (courseId: string) =>
    apiClient
      .post<ApiResponse<Registration>>("/registrations/drop", { courseId })
      .then((r) => r.data.data),

  getMyRegistrations: (status?: RegistrationStatus) =>
    apiClient
      .get<ApiResponse<Registration[]>>("/registrations/my", { params: { status } })
      .then((r) => r.data.data),

  getMySemesterRegistrations: (programId: string, level: number, semester: number) =>
    apiClient
      .get<ApiResponse<Registration[]>>(
        `/registrations/my/${programId}/level/${level}/semester/${semester}`
      )
      .then((r) => r.data.data),

  getCourseEnrollments: (courseId: string) =>
    apiClient
      .get<ApiResponse<Registration[]>>(`/registrations/course/${courseId}`)
      .then((r) => r.data.data),

  getEnrollmentCount: (courseId: string) =>
    apiClient
      .get<ApiResponse<{ count: number }>>(`/registrations/course/${courseId}/count`)
      .then((r) => r.data.data.count),

  markComplete: (registrationId: string) =>
    apiClient
      .patch<ApiResponse<Registration>>(`/registrations/${registrationId}/complete`)
      .then((r) => r.data.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Registration>>(`/registrations/${id}`)
      .then((r) => r.data.data),
};

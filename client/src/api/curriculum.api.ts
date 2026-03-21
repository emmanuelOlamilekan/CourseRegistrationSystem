import { apiClient } from "./client";
import type {
  ApiResponse,
  Program,
  Curriculum,
  CourseMapping,
  CourseMappingType,
  Prerequisite,
  StudentCurriculum,
  GraduationEligibility,
} from "@/types";

export const curriculumApi = {
  // Programs
  getPrograms: (params?: { departmentId?: string; isActive?: boolean }) =>
    apiClient
      .get<{ success: boolean; programs: Program[]; total: number }>("/programs", { params })
      .then((r) => ({ programs: r.data.programs, total: r.data.total })),

  getProgramById: (id: string) =>
    apiClient.get<ApiResponse<Program>>(`/programs/${id}`).then((r) => r.data.data),

  createProgram: (payload: { name: string; departmentId: string; duration: number }) =>
    apiClient.post<ApiResponse<Program>>("/programs", payload).then((r) => r.data.data),

  updateProgram: (id: string, payload: { name?: string; duration?: number; isActive?: boolean }) =>
    apiClient
      .patch<ApiResponse<Program>>(`/programs/${id}`, payload)
      .then((r) => r.data.data),

  deleteProgram: (id: string) => apiClient.delete(`/programs/${id}`),

  // Curricula
  getCurriculaByProgram: (programId: string) =>
    apiClient
      .get<ApiResponse<Curriculum[]>>(`/curricula/program/${programId}`)
      .then((r) => r.data.data),

  getActiveCurriculum: (programId: string) =>
    apiClient
      .get<ApiResponse<Curriculum>>(`/curricula/program/${programId}/active`)
      .then((r) => r.data.data),

  getCurriculumById: (id: string) =>
    apiClient.get<ApiResponse<Curriculum>>(`/curricula/${id}`).then((r) => r.data.data),

  createCurriculum: (payload: { programId: string; version: number }) =>
    apiClient
      .post<ApiResponse<Curriculum>>("/curricula", payload)
      .then((r) => r.data.data),

  activateCurriculum: (id: string) =>
    apiClient
      .patch<ApiResponse<Curriculum>>(`/curricula/${id}/activate`)
      .then((r) => r.data.data),

  deactivateCurriculum: (id: string) =>
    apiClient
      .patch<ApiResponse<Curriculum>>(`/curricula/${id}/deactivate`)
      .then((r) => r.data.data),

  deleteCurriculum: (id: string) => apiClient.delete(`/curricula/${id}`),

  // Course Mappings
  getCourseMappings: (curriculumId: string, params?: { level?: number; semester?: number }) =>
    apiClient
      .get<ApiResponse<CourseMapping[]>>(`/curricula/${curriculumId}/courses`, { params })
      .then((r) => r.data.data),

  getCreditUnits: (curriculumId: string, type?: CourseMappingType) =>
    apiClient
      .get<ApiResponse<{ total: number }>>(`/curricula/${curriculumId}/courses/credits`, {
        params: { type },
      })
      .then((r) => r.data.data.total),

  addCourseMapping: (
    curriculumId: string,
    payload: {
      courseId: string;
      level: number;
      semester: number;
      type: CourseMappingType;
      creditUnit: number;
    }
  ) =>
    apiClient
      .post<ApiResponse<CourseMapping>>(`/curricula/${curriculumId}/courses`, payload)
      .then((r) => r.data.data),

  updateCourseMapping: (
    curriculumId: string,
    mappingId: string,
    payload: { level?: number; semester?: number; type?: CourseMappingType; creditUnit?: number }
  ) =>
    apiClient
      .patch<ApiResponse<CourseMapping>>(
        `/curricula/${curriculumId}/courses/${mappingId}`,
        payload
      )
      .then((r) => r.data.data),

  removeCourseMapping: (curriculumId: string, mappingId: string) =>
    apiClient.delete(`/curricula/${curriculumId}/courses/${mappingId}`),

  // Prerequisites
  getPrerequisites: (courseId: string) =>
    apiClient
      .get<ApiResponse<Prerequisite[]>>(`/prerequisites/${courseId}`)
      .then((r) => r.data.data),

  getAllPrerequisites: (courseId: string) =>
    apiClient
      .get<ApiResponse<string[]>>(`/prerequisites/${courseId}/all`)
      .then((r) => r.data.data),

  addPrerequisite: (courseId: string, requiredCourseId: string) =>
    apiClient
      .post<ApiResponse<Prerequisite>>("/prerequisites", { courseId, requiredCourseId })
      .then((r) => r.data.data),

  removePrerequisite: (courseId: string, requiredCourseId: string) =>
    apiClient.delete("/prerequisites", { data: { courseId, requiredCourseId } }),

  // Student Curricula
  getStudentCurriculum: (studentId: string, programId: string) =>
    apiClient
      .get<ApiResponse<StudentCurriculum>>(`/student-curricula/${studentId}/${programId}`)
      .then((r) => r.data.data),

  getStudentCurriculumHistory: (studentId: string, programId: string) =>
    apiClient
      .get<ApiResponse<StudentCurriculum[]>>(
        `/student-curricula/${studentId}/${programId}/history`
      )
      .then((r) => r.data.data),

  assignCurriculum: (studentId: string, curriculumId: string) =>
    apiClient
      .post<ApiResponse<StudentCurriculum>>("/student-curricula/assign", {
        studentId,
        curriculumId,
      })
      .then((r) => r.data.data),

  migrateCurriculum: (studentId: string, newCurriculumId: string) =>
    apiClient
      .post<ApiResponse<StudentCurriculum>>("/student-curricula/migrate", {
        studentId,
        newCurriculumId,
      })
      .then((r) => r.data.data),

  checkGraduation: (studentId: string, programId: string, completedCourseIds: string[]) =>
    apiClient
      .post<ApiResponse<GraduationEligibility>>("/student-curricula/graduation-check", {
        studentId,
        programId,
        completedCourseIds,
      })
      .then((r) => r.data.data),
};

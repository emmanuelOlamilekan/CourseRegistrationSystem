// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "lecturer" | "course_advisor" | "admin";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  userId: string;
  role: UserRole;
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Course Catalogue ──────────────────────────────────────────────────────────

export interface Faculty {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Department {
  _id: string;
  name: string;
  facultyId: string;
  isActive: boolean;
}

export interface Course {
  _id: string;
  title: string;
  code: string;
  description?: string;
  lecturerId: string;
  departmentId: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

// ── Registration ───────────────────────────────────────────────────────────────

export type RegistrationStatus = "enrolled" | "completed" | "dropped" | "waitlisted";

export interface Registration {
  _id: string;
  studentId: string;
  courseId: string;
  programId: string;
  curriculumId: string;
  level: number;
  semester: number;
  status: RegistrationStatus;
  enrolledAt: string;
  completedAt?: string;
  droppedAt?: string;
}

// ── Curriculum ────────────────────────────────────────────────────────────────

export interface Program {
  _id: string;
  name: string;
  departmentId: string;
  duration: number;
  isActive: boolean;
}

export interface Curriculum {
  _id: string;
  programId: string;
  version: number;
  isActive: boolean;
  createdAt: string;
}

export type CourseMappingType = "Core" | "Elective";

export interface CourseMapping {
  _id: string;
  curriculumId: string;
  courseId: string;
  level: number;
  semester: number;
  type: CourseMappingType;
  creditUnit: number;
}

export interface Prerequisite {
  _id: string;
  courseId: string;
  requiredCourseId: string;
}

export interface StudentCurriculum {
  _id: string;
  studentId: string;
  curriculumId: string;
  programId: string;
  assignedAt: string;
  isActive: boolean;
  migratedFrom?: string;
}

export interface GraduationEligibility {
  eligible: boolean;
  completedCoreCount: number;
  totalCoreCount: number;
  missingCoreCourses: string[];
  completedCreditUnits: number;
  requiredCreditUnits: number;
  creditUnitsSatisfied: boolean;
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
}

export interface ApiError {
  success: false;
  message: string;
}

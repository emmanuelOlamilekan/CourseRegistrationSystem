/**
 * HTTP client for the curriculum-service.
 * The registration service calls these endpoints to enforce:
 *  - Course belongs to the student's active curriculum
 *  - Prerequisites are satisfied before enrollment
 *  - Core-course drop protection
 */

const BASE_URL = () =>
  process.env.CURRICULUM_SERVICE_URL ?? "http://localhost:3005";

export interface CourseMapping {
  _id: string;
  curriculumId: string;
  courseId: string;
  level: number;
  semester: number;
  type: "Core" | "Elective";
  creditUnit: number;
}

export interface StudentCurriculumAssignment {
  _id: string;
  studentId: string;
  curriculumId: string;
  programId: string;
  isActive: boolean;
}

async function get<T>(path: string): Promise<T> {
  const url = `${BASE_URL()}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      body.message ?? `Curriculum service error: ${res.status} ${path}`
    );
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

/**
 * Get a student's active curriculum assignment for a program.
 * Throws if none found.
 */
export async function getStudentCurriculum(
  studentId: string,
  programId: string
): Promise<StudentCurriculumAssignment> {
  return get<StudentCurriculumAssignment>(
    `/student-curricula/${studentId}/${programId}`
  );
}

/**
 * Get the course mapping for a specific course within a curriculum.
 * Throws if the course is not in the curriculum (i.e. student cannot register it).
 */
export async function getCourseMapping(
  curriculumId: string,
  courseId: string
): Promise<CourseMapping> {
  // Fetch all mappings for the curriculum then find the specific course
  const mappings = await get<CourseMapping[]>(
    `/curricula/${curriculumId}/courses`
  );
  const mapping = mappings.find((m) => m.courseId === courseId);
  if (!mapping) {
    throw new Error(
      "Course is not part of the student's active curriculum. Enrollment denied."
    );
  }
  return mapping;
}

/**
 * Get direct prerequisite courseIds for a course.
 */
export async function getCoursePrerequisites(
  courseId: string
): Promise<string[]> {
  const prereqs = await get<Array<{ requiredCourseId: string }>>(
    `/prerequisites/${courseId}`
  );
  return prereqs.map((p) => p.requiredCourseId);
}

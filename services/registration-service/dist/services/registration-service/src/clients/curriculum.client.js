"use strict";
/**
 * HTTP client for the curriculum-service.
 * The registration service calls these endpoints to enforce:
 *  - Course belongs to the student's active curriculum
 *  - Prerequisites are satisfied before enrollment
 *  - Core-course drop protection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentCurriculum = getStudentCurriculum;
exports.getCourseMapping = getCourseMapping;
exports.getCoursePrerequisites = getCoursePrerequisites;
const BASE_URL = () => process.env.CURRICULUM_SERVICE_URL ?? "http://localhost:3005";
async function get(path) {
    const url = `${BASE_URL()}${path}`;
    const res = await fetch(url);
    if (!res.ok) {
        const body = (await res.json().catch(() => ({})));
        throw new Error(body.message ?? `Curriculum service error: ${res.status} ${path}`);
    }
    const json = (await res.json());
    return json.data;
}
/**
 * Get a student's active curriculum assignment for a program.
 * Throws if none found.
 */
async function getStudentCurriculum(studentId, programId) {
    return get(`/student-curricula/${studentId}/${programId}`);
}
/**
 * Get the course mapping for a specific course within a curriculum.
 * Throws if the course is not in the curriculum (i.e. student cannot register it).
 */
async function getCourseMapping(curriculumId, courseId) {
    // Fetch all mappings for the curriculum then find the specific course
    const mappings = await get(`/curricula/${curriculumId}/courses`);
    const mapping = mappings.find((m) => m.courseId === courseId);
    if (!mapping) {
        throw new Error("Course is not part of the student's active curriculum. Enrollment denied.");
    }
    return mapping;
}
/**
 * Get direct prerequisite courseIds for a course.
 */
async function getCoursePrerequisites(courseId) {
    const prereqs = await get(`/prerequisites/${courseId}`);
    return prereqs.map((p) => p.requiredCourseId);
}

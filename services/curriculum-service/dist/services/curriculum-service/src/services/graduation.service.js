"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraduationService = void 0;
const courseMapping_model_1 = require("../models/courseMapping.model");
const studentCurriculum_model_1 = require("../models/studentCurriculum.model");
const curriculum_model_1 = require("../models/curriculum.model");
const errors_1 = require("../../../../shared/errors");
class GraduationService {
    /**
     * Business Rule: Core courses are mandatory for graduation.
     * Checks if the student has completed all core courses in their active curriculum
     * and meets the minimum credit unit requirement.
     *
     * @param studentId - The student's ID
     * @param programId - The program ID
     * @param completedCourseIds - Array of courseIds the student has passed
     */
    static async checkEligibility(studentId, programId, completedCourseIds) {
        // Get the student's active curriculum
        const assignment = await studentCurriculum_model_1.StudentCurriculum.findOne({
            studentId,
            programId,
            isActive: true,
        });
        if (!assignment) {
            throw new errors_1.NotFoundError("No active curriculum found for this student in this program");
        }
        const curriculumId = String(assignment.curriculumId);
        // Get all core courses for the curriculum
        const coreCourses = await GraduationService.getCoreCourses(curriculumId);
        const completedSet = new Set(completedCourseIds);
        const missingCoreCourses = coreCourses.filter((courseId) => !completedSet.has(courseId));
        const completedCoreCount = coreCourses.length - missingCoreCourses.length;
        // Compute credit units for completed courses
        const completedMappings = await courseMapping_model_1.CourseMapping.find({
            curriculumId,
            courseId: { $in: completedCourseIds },
        });
        const completedCreditUnits = completedMappings.reduce((sum, m) => sum + m.creditUnit, 0);
        const requiredCreditUnits = await GraduationService.getTotalCreditRequirement(curriculumId);
        const creditUnitsSatisfied = completedCreditUnits >= requiredCreditUnits;
        const eligible = missingCoreCourses.length === 0 && creditUnitsSatisfied;
        return {
            eligible,
            completedCoreCount,
            totalCoreCount: coreCourses.length,
            missingCoreCourses,
            completedCreditUnits,
            requiredCreditUnits,
            creditUnitsSatisfied,
        };
    }
    /**
     * Returns all courseIds mapped as "Core" in the given curriculum.
     */
    static async getCoreCourses(curriculumId) {
        const mappings = await courseMapping_model_1.CourseMapping.find({
            curriculumId,
            type: "Core",
        }).select("courseId");
        return mappings.map((m) => m.courseId);
    }
    /**
     * Returns the total credit units required to graduate (sum of all courses in curriculum).
     * Programs define graduation requirements via the full curriculum credit load.
     */
    static async getTotalCreditRequirement(curriculumId) {
        // Verify curriculum exists
        const curriculum = await curriculum_model_1.Curriculum.findById(curriculumId);
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        const result = await courseMapping_model_1.CourseMapping.aggregate([
            { $match: { curriculumId } },
            { $group: { _id: null, total: { $sum: "$creditUnit" } } },
        ]);
        return result[0]?.total ?? 0;
    }
}
exports.GraduationService = GraduationService;

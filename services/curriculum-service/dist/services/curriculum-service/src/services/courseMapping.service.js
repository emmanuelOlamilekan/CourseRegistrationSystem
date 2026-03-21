"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseMappingService = void 0;
const courseMapping_model_1 = require("../models/courseMapping.model");
const errors_1 = require("../../../../shared/errors");
class CourseMappingService {
    /**
     * Business Rule: A course cannot exist in multiple levels within the same curriculum.
     * Enforced via unique index on { curriculumId, courseId }.
     */
    static async addCourse(data) {
        const existing = await courseMapping_model_1.CourseMapping.findOne({
            curriculumId: data.curriculumId,
            courseId: data.courseId,
        });
        if (existing) {
            throw new errors_1.BadRequestError("This course is already mapped to this curriculum at another level");
        }
        return courseMapping_model_1.CourseMapping.create(data);
    }
    static async updateCourse(id, data) {
        const mapping = await courseMapping_model_1.CourseMapping.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!mapping)
            throw new errors_1.NotFoundError("Course mapping not found");
        return mapping;
    }
    static async removeCourse(id) {
        const mapping = await courseMapping_model_1.CourseMapping.findByIdAndDelete(id);
        if (!mapping)
            throw new errors_1.NotFoundError("Course mapping not found");
    }
    static async findByCurriculum(curriculumId) {
        return courseMapping_model_1.CourseMapping.find({ curriculumId }).sort({ level: 1, semester: 1 });
    }
    static async findByLevel(curriculumId, level) {
        return courseMapping_model_1.CourseMapping.find({ curriculumId, level }).sort({ semester: 1 });
    }
    static async getSemesterCourses(curriculumId, level, semester) {
        return courseMapping_model_1.CourseMapping.find({ curriculumId, level, semester });
    }
    static async getTotalCreditUnits(curriculumId, type) {
        const filter = { curriculumId };
        if (type)
            filter.type = type;
        const result = await courseMapping_model_1.CourseMapping.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$creditUnit" } } },
        ]);
        return result[0]?.total ?? 0;
    }
    static async findById(id) {
        const mapping = await courseMapping_model_1.CourseMapping.findById(id);
        if (!mapping)
            throw new errors_1.NotFoundError("Course mapping not found");
        return mapping;
    }
}
exports.CourseMappingService = CourseMappingService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const course_model_1 = require("../models/course.model");
const department_model_1 = require("../models/department.model");
const errors_1 = require("../../../../shared/errors");
class CourseService {
    static async create(data) {
        const department = await department_model_1.Department.findById(data.departmentId);
        if (!department)
            throw new errors_1.NotFoundError("Department not found");
        const existing = await course_model_1.Course.findOne({ code: data.code.toUpperCase() });
        if (existing)
            throw new errors_1.BadRequestError("Course with this code already exists");
        return course_model_1.Course.create(data);
    }
    static async findAll(query = {}) {
        const { departmentId, lecturerId, search, page = 1, limit = 20 } = query;
        const filter = {};
        if (departmentId)
            filter.departmentId = departmentId;
        if (lecturerId)
            filter.lecturerId = lecturerId;
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            course_model_1.Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            course_model_1.Course.countDocuments(filter),
        ]);
        return { courses, total };
    }
    static async findById(id) {
        const course = await course_model_1.Course.findById(id);
        if (!course)
            throw new errors_1.NotFoundError("Course not found");
        return course;
    }
    static async findByCode(code) {
        const course = await course_model_1.Course.findOne({ code: code.toUpperCase() });
        if (!course)
            throw new errors_1.NotFoundError("Course not found");
        return course;
    }
    static async findByDepartment(departmentId) {
        return course_model_1.Course.find({ departmentId }).sort({ code: 1 });
    }
    static async update(id, data) {
        if (data.departmentId) {
            const department = await department_model_1.Department.findById(data.departmentId);
            if (!department)
                throw new errors_1.NotFoundError("Department not found");
        }
        const course = await course_model_1.Course.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!course)
            throw new errors_1.NotFoundError("Course not found");
        return course;
    }
    static async delete(id) {
        const course = await course_model_1.Course.findByIdAndDelete(id);
        if (!course)
            throw new errors_1.NotFoundError("Course not found");
    }
}
exports.CourseService = CourseService;

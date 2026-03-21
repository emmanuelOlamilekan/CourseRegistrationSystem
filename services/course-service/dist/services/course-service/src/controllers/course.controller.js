"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const course_service_1 = require("../services/course.service");
class CourseController {
    static async create(req, res) {
        const course = await course_service_1.CourseService.create(req.body);
        res.status(201).json({ success: true, data: course });
    }
    static async findAll(req, res) {
        const { departmentId, lecturerId, search, page, limit } = req.query;
        const result = await course_service_1.CourseService.findAll({
            departmentId: departmentId ? String(departmentId) : undefined,
            lecturerId: lecturerId ? String(lecturerId) : undefined,
            search: search ? String(search) : undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json({ success: true, ...result });
    }
    static async findById(req, res) {
        const course = await course_service_1.CourseService.findById(String(req.params.id));
        res.json({ success: true, data: course });
    }
    static async findByCode(req, res) {
        const course = await course_service_1.CourseService.findByCode(String(req.params.code));
        res.json({ success: true, data: course });
    }
    static async findByDepartment(req, res) {
        const courses = await course_service_1.CourseService.findByDepartment(String(req.params.departmentId));
        res.json({ success: true, data: courses });
    }
    static async update(req, res) {
        const course = await course_service_1.CourseService.update(String(req.params.id), req.body);
        res.json({ success: true, data: course });
    }
    static async delete(req, res) {
        await course_service_1.CourseService.delete(String(req.params.id));
        res.status(204).send();
    }
}
exports.CourseController = CourseController;

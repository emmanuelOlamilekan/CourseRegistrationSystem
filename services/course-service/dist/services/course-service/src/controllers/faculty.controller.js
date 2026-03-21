"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyController = void 0;
const faculty_service_1 = require("../services/faculty.service");
class FacultyController {
    static async create(req, res) {
        const faculty = await faculty_service_1.FacultyService.create(req.body);
        res.status(201).json({ success: true, data: faculty });
    }
    static async findAll(_req, res) {
        const faculties = await faculty_service_1.FacultyService.findAll();
        res.json({ success: true, data: faculties });
    }
    static async findById(req, res) {
        const faculty = await faculty_service_1.FacultyService.findById(String(req.params.id));
        res.json({ success: true, data: faculty });
    }
    static async update(req, res) {
        const faculty = await faculty_service_1.FacultyService.update(String(req.params.id), req.body);
        res.json({ success: true, data: faculty });
    }
    static async delete(req, res) {
        await faculty_service_1.FacultyService.delete(String(req.params.id));
        res.status(204).send();
    }
}
exports.FacultyController = FacultyController;

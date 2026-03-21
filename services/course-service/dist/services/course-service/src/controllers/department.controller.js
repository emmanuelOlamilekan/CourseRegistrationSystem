"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const department_service_1 = require("../services/department.service");
class DepartmentController {
    static async create(req, res) {
        const department = await department_service_1.DepartmentService.create(req.body);
        res.status(201).json({ success: true, data: department });
    }
    static async findAll(_req, res) {
        const departments = await department_service_1.DepartmentService.findAll();
        res.json({ success: true, data: departments });
    }
    static async findById(req, res) {
        const department = await department_service_1.DepartmentService.findById(String(req.params.id));
        res.json({ success: true, data: department });
    }
    static async findByFaculty(req, res) {
        const departments = await department_service_1.DepartmentService.findByFaculty(String(req.params.facultyId));
        res.json({ success: true, data: departments });
    }
    static async update(req, res) {
        const department = await department_service_1.DepartmentService.update(String(req.params.id), req.body);
        res.json({ success: true, data: department });
    }
    static async delete(req, res) {
        await department_service_1.DepartmentService.delete(String(req.params.id));
        res.status(204).send();
    }
}
exports.DepartmentController = DepartmentController;

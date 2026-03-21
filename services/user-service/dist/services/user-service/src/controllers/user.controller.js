"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    static async create(req, res) {
        const user = await user_service_1.UserService.create(req.body);
        res.status(201).json({ success: true, data: user });
    }
    static async findAll(req, res) {
        const { role, facultyId, departmentId, isActive, page, limit } = req.query;
        const result = await user_service_1.UserService.findAll({
            role: role ? String(role) : undefined,
            facultyId: facultyId ? String(facultyId) : undefined,
            departmentId: departmentId ? String(departmentId) : undefined,
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json({ success: true, ...result });
    }
    static async findById(req, res) {
        const user = await user_service_1.UserService.findById(String(req.params.id));
        res.json({ success: true, data: user });
    }
    static async getMe(req, res) {
        const user = await user_service_1.UserService.findById(req.user.userId);
        res.json({ success: true, data: user });
    }
    static async updateMe(req, res) {
        const user = await user_service_1.UserService.updateProfile(req.user.userId, req.body);
        res.json({ success: true, data: user });
    }
    static async updateById(req, res) {
        const user = await user_service_1.UserService.updateById(String(req.params.id), req.body);
        res.json({ success: true, data: user });
    }
    static async findByFaculty(req, res) {
        const { role } = req.query;
        const users = await user_service_1.UserService.findByFaculty(String(req.params.facultyId), role ? String(role) : undefined);
        res.json({ success: true, data: users });
    }
    static async findByDepartment(req, res) {
        const { role } = req.query;
        const users = await user_service_1.UserService.findByDepartment(String(req.params.departmentId), role ? String(role) : undefined);
        res.json({ success: true, data: users });
    }
    static async deactivate(req, res) {
        const user = await user_service_1.UserService.deactivate(String(req.params.id));
        res.json({ success: true, data: user });
    }
}
exports.UserController = UserController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const errors_1 = require("../../../../shared/errors");
class UserService {
    static async create(data) {
        const existing = await user_model_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing)
            throw new errors_1.BadRequestError("User already exists");
        return user_model_1.User.create(data);
    }
    static async findAll(query = {}) {
        const { role, facultyId, departmentId, isActive = true, page = 1, limit = 20 } = query;
        const filter = { isActive };
        if (role)
            filter.role = role;
        if (facultyId)
            filter.facultyId = facultyId;
        if (departmentId)
            filter.departmentId = departmentId;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            user_model_1.User.find(filter).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(limit),
            user_model_1.User.countDocuments(filter),
        ]);
        return { users, total };
    }
    static async findById(id) {
        const user = await user_model_1.User.findById(id);
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        return user;
    }
    static async findByEmail(email) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        return user;
    }
    static async findByFaculty(facultyId, role) {
        const filter = { facultyId, isActive: true };
        if (role)
            filter.role = role;
        return user_model_1.User.find(filter).sort({ lastName: 1, firstName: 1 });
    }
    static async findByDepartment(departmentId, role) {
        const filter = { departmentId, isActive: true };
        if (role)
            filter.role = role;
        return user_model_1.User.find(filter).sort({ lastName: 1, firstName: 1 });
    }
    static async updateProfile(id, data) {
        const user = await user_model_1.User.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        return user;
    }
    static async updateById(id, data) {
        const user = await user_model_1.User.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        return user;
    }
    static async deactivate(id) {
        const user = await user_model_1.User.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        return user;
    }
}
exports.UserService = UserService;

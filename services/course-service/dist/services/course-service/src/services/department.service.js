"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const department_model_1 = require("../models/department.model");
const faculty_model_1 = require("../models/faculty.model");
const errors_1 = require("../../../../shared/errors");
class DepartmentService {
    static async create(data) {
        const faculty = await faculty_model_1.Faculty.findById(data.facultyId);
        if (!faculty)
            throw new errors_1.NotFoundError("Faculty not found");
        const existing = await department_model_1.Department.findOne({ code: data.code.toUpperCase() });
        if (existing)
            throw new errors_1.BadRequestError("Department with this code already exists");
        return department_model_1.Department.create({ ...data, code: data.code.toUpperCase() });
    }
    static async findAll() {
        return department_model_1.Department.find().sort({ name: 1 });
    }
    static async findById(id) {
        const department = await department_model_1.Department.findById(id);
        if (!department)
            throw new errors_1.NotFoundError("Department not found");
        return department;
    }
    static async findByFaculty(facultyId) {
        return department_model_1.Department.find({ facultyId }).sort({ name: 1 });
    }
    static async update(id, data) {
        if (data.code)
            data.code = data.code.toUpperCase();
        if (data.facultyId) {
            const faculty = await faculty_model_1.Faculty.findById(data.facultyId);
            if (!faculty)
                throw new errors_1.NotFoundError("Faculty not found");
        }
        const department = await department_model_1.Department.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!department)
            throw new errors_1.NotFoundError("Department not found");
        return department;
    }
    static async delete(id) {
        const department = await department_model_1.Department.findByIdAndDelete(id);
        if (!department)
            throw new errors_1.NotFoundError("Department not found");
    }
}
exports.DepartmentService = DepartmentService;

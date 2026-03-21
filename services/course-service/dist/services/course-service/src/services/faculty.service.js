"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyService = void 0;
const faculty_model_1 = require("../models/faculty.model");
const errors_1 = require("../../../../shared/errors");
class FacultyService {
    static async create(data) {
        const existing = await faculty_model_1.Faculty.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${data.name}$`, "i") } },
                { code: data.code.toUpperCase() },
            ],
        });
        if (existing)
            throw new errors_1.BadRequestError("Faculty with this name or code already exists");
        return faculty_model_1.Faculty.create({ name: data.name, code: data.code.toUpperCase() });
    }
    static async findAll() {
        return faculty_model_1.Faculty.find().sort({ name: 1 });
    }
    static async findById(id) {
        const faculty = await faculty_model_1.Faculty.findById(id);
        if (!faculty)
            throw new errors_1.NotFoundError("Faculty not found");
        return faculty;
    }
    static async update(id, data) {
        if (data.code)
            data.code = data.code.toUpperCase();
        const faculty = await faculty_model_1.Faculty.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!faculty)
            throw new errors_1.NotFoundError("Faculty not found");
        return faculty;
    }
    static async delete(id) {
        const faculty = await faculty_model_1.Faculty.findByIdAndDelete(id);
        if (!faculty)
            throw new errors_1.NotFoundError("Faculty not found");
    }
}
exports.FacultyService = FacultyService;

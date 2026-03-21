"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters").trim(),
    code: zod_1.z.string().min(2, "Code must be at least 2 characters").trim(),
    description: zod_1.z.string().trim().optional(),
    lecturerId: zod_1.z.string().min(1, "Lecturer ID is required"),
    departmentId: zod_1.z.string().min(1, "Department ID is required"),
    capacity: zod_1.z.number().int().min(1, "Capacity must be at least 1").optional(),
});
exports.updateCourseSchema = exports.createCourseSchema.partial();

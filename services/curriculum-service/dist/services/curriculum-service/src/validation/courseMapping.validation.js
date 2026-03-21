"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseMappingSchema = exports.addCourseMappingSchema = void 0;
const zod_1 = require("zod");
exports.addCourseMappingSchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1, "Course ID is required"),
    level: zod_1.z.number().int().min(1).max(8),
    semester: zod_1.z.number().int().min(1).max(2),
    type: zod_1.z.enum(["Core", "Elective"]),
    creditUnit: zod_1.z.number().int().min(1).max(6),
});
exports.updateCourseMappingSchema = zod_1.z.object({
    level: zod_1.z.number().int().min(1).max(8).optional(),
    semester: zod_1.z.number().int().min(1).max(2).optional(),
    type: zod_1.z.enum(["Core", "Elective"]).optional(),
    creditUnit: zod_1.z.number().int().min(1).max(6).optional(),
});

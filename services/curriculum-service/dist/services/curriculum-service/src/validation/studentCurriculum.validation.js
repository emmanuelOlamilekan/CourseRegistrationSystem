"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graduationCheckSchema = exports.migrateCurriculumSchema = exports.assignCurriculumSchema = void 0;
const zod_1 = require("zod");
exports.assignCurriculumSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    curriculumId: zod_1.z.string().min(1, "Curriculum ID is required"),
});
exports.migrateCurriculumSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    newCurriculumId: zod_1.z.string().min(1, "New curriculum ID is required"),
});
exports.graduationCheckSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    programId: zod_1.z.string().min(1, "Program ID is required"),
    completedCourseIds: zod_1.z
        .array(zod_1.z.string().min(1))
        .min(1, "At least one completed course ID is required"),
});

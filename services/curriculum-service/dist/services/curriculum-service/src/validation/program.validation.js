"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgramSchema = exports.createProgramSchema = void 0;
const zod_1 = require("zod");
exports.createProgramSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim(),
    departmentId: zod_1.z.string().min(1, "Department ID is required"),
    duration: zod_1.z.number().int().min(1).max(6),
});
exports.updateProgramSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim().optional(),
    duration: zod_1.z.number().int().min(1).max(6).optional(),
    isActive: zod_1.z.boolean().optional(),
});

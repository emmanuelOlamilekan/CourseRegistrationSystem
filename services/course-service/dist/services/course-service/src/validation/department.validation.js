"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").trim(),
    code: zod_1.z.string().min(2, "Code must be at least 2 characters").trim(),
    facultyId: zod_1.z.string().min(1, "Faculty ID is required"),
});
exports.updateDepartmentSchema = exports.createDepartmentSchema.partial();

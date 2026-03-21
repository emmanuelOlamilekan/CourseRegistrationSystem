"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFacultySchema = exports.createFacultySchema = void 0;
const zod_1 = require("zod");
exports.createFacultySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").trim(),
    code: zod_1.z.string().min(2, "Code must be at least 2 characters").trim(),
});
exports.updateFacultySchema = exports.createFacultySchema.partial();

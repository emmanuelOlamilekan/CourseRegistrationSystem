"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropSchema = exports.enrollSchema = void 0;
const zod_1 = require("zod");
exports.enrollSchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1, "Course ID is required"),
    programId: zod_1.z.string().min(1, "Program ID is required"),
});
exports.dropSchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1, "Course ID is required"),
});

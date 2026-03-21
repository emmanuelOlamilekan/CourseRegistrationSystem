"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPrerequisiteSchema = void 0;
const zod_1 = require("zod");
exports.addPrerequisiteSchema = zod_1.z
    .object({
    courseId: zod_1.z.string().min(1, "Course ID is required"),
    requiredCourseId: zod_1.z.string().min(1, "Required course ID is required"),
})
    .superRefine((data, ctx) => {
    if (data.courseId === data.requiredCourseId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["requiredCourseId"],
            message: "A course cannot be its own prerequisite",
        });
    }
});

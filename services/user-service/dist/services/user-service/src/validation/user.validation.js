"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateSchema = exports.updateProfileSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const userRoles = ["student", "lecturer", "course_advisor", "admin"];
const staffRoles = ["lecturer", "course_advisor", "admin"];
exports.createUserSchema = zod_1.z
    .object({
    email: zod_1.z.string().email("Invalid email format"),
    firstName: zod_1.z.string().min(1, "First name is required").trim(),
    lastName: zod_1.z.string().min(1, "Last name is required").trim(),
    role: zod_1.z.enum(userRoles),
    facultyId: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    matricNumber: zod_1.z.string().optional(),
    staffId: zod_1.z.string().optional(),
    isLevelAdvisor: zod_1.z.boolean().optional(),
    levelAdvising: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
})
    .superRefine((data, ctx) => {
    // Students must have a matric number
    if (data.role === "student" && !data.matricNumber) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["matricNumber"],
            message: "Matric number is required for students",
        });
    }
    // Staff must have a staff ID
    if (staffRoles.includes(data.role) && !data.staffId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "Staff ID is required for lecturers, course advisors and admins",
        });
    }
    // Level advisor must be a lecturer with a staff ID
    if (data.isLevelAdvisor) {
        if (data.role !== "lecturer") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["isLevelAdvisor"],
                message: "Only lecturers can be assigned as level advisors",
            });
        }
        if (!data.staffId) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["staffId"],
                message: "Staff ID is required to be assigned as a level advisor",
            });
        }
    }
    // Students must not have a staff ID
    if (data.role === "student" && data.staffId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "Students cannot have a staff ID",
        });
    }
    // Non-students must not have a matric number
    if (data.role !== "student" && data.matricNumber) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["matricNumber"],
            message: "Matric number is only applicable to students",
        });
    }
});
exports.updateProfileSchema = zod_1.z
    .object({
    firstName: zod_1.z.string().min(1).trim().optional(),
    lastName: zod_1.z.string().min(1).trim().optional(),
    facultyId: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    matricNumber: zod_1.z.string().optional(),
    staffId: zod_1.z.string().optional(),
    isLevelAdvisor: zod_1.z.boolean().optional(),
    levelAdvising: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
})
    .superRefine((data, ctx) => {
    // If setting as level advisor, staffId must be present
    if (data.isLevelAdvisor && !data.staffId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "Staff ID is required to be assigned as a level advisor",
        });
    }
});
exports.adminUpdateSchema = exports.updateProfileSchema
    .innerType()
    .extend({ isActive: zod_1.z.boolean().optional() })
    .superRefine((data, ctx) => {
    if (data.isLevelAdvisor && !data.staffId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "Staff ID is required to be assigned as a level advisor",
        });
    }
});

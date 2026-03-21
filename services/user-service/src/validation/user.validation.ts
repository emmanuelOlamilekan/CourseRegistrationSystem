import { z } from "zod";

const userRoles = ["student", "lecturer", "course_advisor", "admin"] as const;
const staffRoles = ["lecturer", "course_advisor", "admin"] as const;

export const createUserSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    role: z.enum(userRoles),
    facultyId: z.string().optional(),
    departmentId: z.string().optional(),
    matricNumber: z.string().optional(),
    staffId: z.string().optional(),
    isLevelAdvisor: z.boolean().optional(),
    levelAdvising: z.array(z.number().int().positive()).optional(),
  })
  .superRefine((data, ctx) => {
    // Students must have a matric number
    if (data.role === "student" && !data.matricNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matricNumber"],
        message: "Matric number is required for students",
      });
    }

    // Staff must have a staff ID
    if ((staffRoles as readonly string[]).includes(data.role) && !data.staffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffId"],
        message: "Staff ID is required for lecturers, course advisors and admins",
      });
    }

    // Level advisor must be a lecturer with a staff ID
    if (data.isLevelAdvisor) {
      if (data.role !== "lecturer") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isLevelAdvisor"],
          message: "Only lecturers can be assigned as level advisors",
        });
      }
      if (!data.staffId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["staffId"],
          message: "Staff ID is required to be assigned as a level advisor",
        });
      }
    }

    // Students must not have a staff ID
    if (data.role === "student" && data.staffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffId"],
        message: "Students cannot have a staff ID",
      });
    }

    // Non-students must not have a matric number
    if (data.role !== "student" && data.matricNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matricNumber"],
        message: "Matric number is only applicable to students",
      });
    }
  });

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).trim().optional(),
    lastName: z.string().min(1).trim().optional(),
    facultyId: z.string().optional(),
    departmentId: z.string().optional(),
    matricNumber: z.string().optional(),
    staffId: z.string().optional(),
    isLevelAdvisor: z.boolean().optional(),
    levelAdvising: z.array(z.number().int().positive()).optional(),
  })
  .superRefine((data, ctx) => {
    // If setting as level advisor, staffId must be present
    if (data.isLevelAdvisor && !data.staffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffId"],
        message: "Staff ID is required to be assigned as a level advisor",
      });
    }
  });

export const adminUpdateSchema = updateProfileSchema
  .innerType()
  .extend({ isActive: z.boolean().optional() })
  .superRefine((data, ctx) => {
    if (data.isLevelAdvisor && !data.staffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffId"],
        message: "Staff ID is required to be assigned as a level advisor",
      });
    }
  });

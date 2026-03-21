import { z } from "zod";

export const addPrerequisiteSchema = z
  .object({
    courseId: z.string().min(1, "Course ID is required"),
    requiredCourseId: z.string().min(1, "Required course ID is required"),
  })
  .superRefine((data, ctx) => {
    if (data.courseId === data.requiredCourseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiredCourseId"],
        message: "A course cannot be its own prerequisite",
      });
    }
  });

export type AddPrerequisiteInput = z.infer<typeof addPrerequisiteSchema>;

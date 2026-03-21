import { z } from "zod";

export const addCourseMappingSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  level: z.number().int().min(1).max(8),
  semester: z.number().int().min(1).max(2),
  type: z.enum(["Core", "Elective"]),
  creditUnit: z.number().int().min(1).max(6),
});

export const updateCourseMappingSchema = z.object({
  level: z.number().int().min(1).max(8).optional(),
  semester: z.number().int().min(1).max(2).optional(),
  type: z.enum(["Core", "Elective"]).optional(),
  creditUnit: z.number().int().min(1).max(6).optional(),
});

export type AddCourseMappingInput = z.infer<typeof addCourseMappingSchema>;
export type UpdateCourseMappingInput = z.infer<typeof updateCourseMappingSchema>;

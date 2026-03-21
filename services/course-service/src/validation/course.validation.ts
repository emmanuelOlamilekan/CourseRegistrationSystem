import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").trim(),
  code: z.string().min(2, "Code must be at least 2 characters").trim(),
  description: z.string().trim().optional(),
  lecturerId: z.string().min(1, "Lecturer ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

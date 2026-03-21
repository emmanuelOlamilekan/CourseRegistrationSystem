import { z } from "zod";

export const enrollSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  programId: z.string().min(1, "Program ID is required"),
});

export const dropSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

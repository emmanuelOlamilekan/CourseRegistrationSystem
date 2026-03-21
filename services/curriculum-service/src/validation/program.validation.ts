import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  departmentId: z.string().min(1, "Department ID is required"),
  duration: z.number().int().min(1).max(6),
});

export const updateProgramSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  duration: z.number().int().min(1).max(6).optional(),
  isActive: z.boolean().optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

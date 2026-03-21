import { z } from "zod";

export const createCurriculumSchema = z.object({
  programId: z.string().min(1, "Program ID is required"),
  version: z.number().int().min(1),
});

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;

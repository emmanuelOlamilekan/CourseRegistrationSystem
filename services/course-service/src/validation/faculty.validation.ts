import { z } from "zod";

export const createFacultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  code: z.string().min(2, "Code must be at least 2 characters").trim(),
});

export const updateFacultySchema = createFacultySchema.partial();

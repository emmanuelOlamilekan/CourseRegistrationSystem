import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  code: z.string().min(2, "Code must be at least 2 characters").trim(),
  facultyId: z.string().min(1, "Faculty ID is required"),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

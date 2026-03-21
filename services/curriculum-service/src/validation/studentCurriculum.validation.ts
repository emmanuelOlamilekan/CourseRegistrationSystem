import { z } from "zod";

export const assignCurriculumSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  curriculumId: z.string().min(1, "Curriculum ID is required"),
});

export const migrateCurriculumSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  newCurriculumId: z.string().min(1, "New curriculum ID is required"),
});

export const graduationCheckSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().min(1, "Program ID is required"),
  completedCourseIds: z
    .array(z.string().min(1))
    .min(1, "At least one completed course ID is required"),
});

export type AssignCurriculumInput = z.infer<typeof assignCurriculumSchema>;
export type MigrateCurriculumInput = z.infer<typeof migrateCurriculumSchema>;
export type GraduationCheckInput = z.infer<typeof graduationCheckSchema>;

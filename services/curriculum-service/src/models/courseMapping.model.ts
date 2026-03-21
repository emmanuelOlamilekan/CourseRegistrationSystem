import mongoose, { Document, Schema } from "mongoose";

export type CourseMappingType = "Core" | "Elective";

export interface ICourseMapping extends Document {
  curriculumId: string;
  courseId: string;
  level: number;
  semester: number;
  type: CourseMappingType;
  creditUnit: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseMappingSchema = new Schema<ICourseMapping>(
  {
    curriculumId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    level: { type: Number, required: true, min: 1, max: 8 },
    semester: { type: Number, required: true, min: 1, max: 2 },
    type: { type: String, enum: ["Core", "Elective"], required: true },
    creditUnit: { type: Number, required: true, min: 1, max: 6 },
  },
  { timestamps: true }
);

// Business Rule: a course cannot exist in multiple levels within the same curriculum
courseMappingSchema.index({ curriculumId: 1, courseId: 1 }, { unique: true });
// Fast queries per level and semester
courseMappingSchema.index({ curriculumId: 1, level: 1, semester: 1 });

export const CourseMapping = mongoose.model<ICourseMapping>(
  "CourseMapping",
  courseMappingSchema
);

import mongoose, { Document, Schema } from "mongoose";

export interface IPrerequisite extends Document {
  courseId: string;
  requiredCourseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const prerequisiteSchema = new Schema<IPrerequisite>(
  {
    courseId: { type: String, required: true, index: true },
    requiredCourseId: { type: String, required: true },
  },
  { timestamps: true }
);

// A course-requiredCourse pair must be unique
prerequisiteSchema.index({ courseId: 1, requiredCourseId: 1 }, { unique: true });

export const Prerequisite = mongoose.model<IPrerequisite>(
  "Prerequisite",
  prerequisiteSchema
);

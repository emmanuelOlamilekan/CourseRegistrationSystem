import mongoose, { Document, Schema } from "mongoose";

export type RegistrationStatus =
  | "enrolled"
  | "completed"
  | "dropped"
  | "waitlisted";

export interface IRegistration extends Document {
  studentId: string;
  courseId: string;
  programId: string;
  curriculumId: string;
  level: number;
  semester: number;
  status: RegistrationStatus;
  enrolledAt: Date;
  completedAt?: Date;
  droppedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    programId: { type: String, required: true, index: true },
    curriculumId: { type: String, required: true },
    level: { type: Number, required: true, min: 1, max: 8 },
    semester: { type: Number, required: true, min: 1, max: 2 },
    status: {
      type: String,
      enum: ["enrolled", "completed", "dropped", "waitlisted"],
      default: "enrolled",
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    droppedAt: { type: Date },
  },
  { timestamps: true }
);

// A student can only have one active (non-dropped) registration per course per curriculum version
registrationSchema.index(
  { studentId: 1, courseId: 1, curriculumId: 1 },
  { unique: true }
);
// Fast lookup by course + status (e.g. enrolled count)
registrationSchema.index({ courseId: 1, status: 1 });
// Fast lookup of all enrollments in a semester
registrationSchema.index({ studentId: 1, programId: 1, level: 1, semester: 1 });

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);

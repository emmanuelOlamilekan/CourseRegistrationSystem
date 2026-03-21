import mongoose, { Document, Schema } from "mongoose";

export interface IStudentCurriculum extends Document {
  studentId: string;
  curriculumId: string;
  programId: string;
  assignedAt: Date;
  isActive: boolean;
  migratedFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentCurriculumSchema = new Schema<IStudentCurriculum>(
  {
    studentId: { type: String, required: true, index: true },
    curriculumId: { type: String, required: true },
    programId: { type: String, required: true, index: true },
    assignedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    migratedFrom: { type: String }, // previous curriculumId for audit trail
  },
  { timestamps: true }
);

// Business Rule: one active curriculum per student per program
studentCurriculumSchema.index(
  { studentId: 1, programId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
studentCurriculumSchema.index({ studentId: 1, programId: 1 });

export const StudentCurriculum = mongoose.model<IStudentCurriculum>(
  "StudentCurriculum",
  studentCurriculumSchema
);

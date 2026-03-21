import mongoose, { Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  facultyId: string;
}

const departmentSchema = new mongoose.Schema<IDepartment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  facultyId: {
    type: String, // referencing Faculty
    required: true
  }

}, { timestamps: true });

// Indexes
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ facultyId: 1 });

export const Department = mongoose.model<IDepartment>(
  "Department",
  departmentSchema
);
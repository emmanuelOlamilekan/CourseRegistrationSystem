import mongoose, { Document, Schema } from "mongoose";

export interface IProgram extends Document {
  name: string;
  departmentId: string;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    name: { type: String, required: true, trim: true },
    departmentId: { type: String, required: true, index: true },
    duration: { type: Number, required: true, min: 1, max: 6 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A department cannot have two programs with the same name
programSchema.index({ departmentId: 1, name: 1 }, { unique: true });

export const Program = mongoose.model<IProgram>("Program", programSchema);

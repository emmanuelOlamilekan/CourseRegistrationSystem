import mongoose, { Document } from "mongoose";

export interface IFaculty extends Document {
  name: string;
  code: string;
}

const facultySchema = new mongoose.Schema<IFaculty>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }
}, { timestamps: true });

// Indexes
facultySchema.index({ name: 1 }, { unique: true });
facultySchema.index({ code: 1 }, { unique: true });

export const Faculty = mongoose.model<IFaculty>("Faculty", facultySchema);
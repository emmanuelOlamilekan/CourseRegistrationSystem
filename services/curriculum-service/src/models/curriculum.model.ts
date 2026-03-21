import mongoose, { Document, Schema } from "mongoose";

export interface ICurriculum extends Document {
  programId: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumSchema = new Schema<ICurriculum>(
  {
    programId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A program cannot have two curricula with the same version
curriculumSchema.index({ programId: 1, version: 1 }, { unique: true });
// Fast lookup of the active curriculum for a program
curriculumSchema.index({ programId: 1, isActive: 1 });

export const Curriculum = mongoose.model<ICurriculum>("Curriculum", curriculumSchema);

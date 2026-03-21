import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  title: string;
  code: string;
  description?: string;

  lecturerId: string;
  departmentId: string;

  capacity: number;

  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    lecturerId: {
      type: String,
      required: true
    },

    departmentId: {
      type: String,
      required: true,
      index: true
    },

    capacity: {
      type: Number,
      default: 100,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

//
// 🔷 Indexes (IMPORTANT for performance)
//
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ departmentId: 1 });
courseSchema.index({ title: "text", code: "text" }); // for search

//
// 🔷 Optional: Pre-save hook (data normalization)
//
courseSchema.pre("save", async function () {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
});

export const Course = mongoose.model<ICourse>("Course", courseSchema);
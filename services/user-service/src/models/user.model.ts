import mongoose, { Document, Schema } from "mongoose";

export type UserRole =
  | "student"
  | "lecturer"
  | "course_advisor"
  | "admin";

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;

  role: UserRole;

  facultyId?: string;
  departmentId?: string;

  matricNumber?: string;
  staffId?: string;

  isLevelAdvisor?: boolean;
  levelAdvising?: number[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    firstName: {
      type: String,
      required: true
    },

    lastName: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "lecturer", "course_advisor", "admin"],
      required: true
    },

    facultyId: {
      type: String,
      index: true
    },

    departmentId: {
      type: String,
      index: true
    },

    // 🎓 Student only
    matricNumber: {
      type: String,
      unique: true,
      sparse: true // allows null for non-students
    },

    // 👨‍🏫 Staff only
    staffId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Lecturer responsibility
    isLevelAdvisor: {
      type: Boolean,
      default: false
    },

    levelAdvising: [
      {
        type: Number
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

//
// 🔥 Indexes
//
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ matricNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ staffId: 1 }, { unique: true, sparse: true });

export const User = mongoose.model<IUser>("User", userSchema);
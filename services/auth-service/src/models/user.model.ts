import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "student" | "lecturer" | "admin";
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "lecturer", "admin"],
    default: "student"
  }
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", userSchema);
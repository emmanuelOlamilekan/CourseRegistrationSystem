import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("Auth DB connected");
  } catch (error) {
    logger.error("Database connection failed", error);
    process.exit(1);
  }
};

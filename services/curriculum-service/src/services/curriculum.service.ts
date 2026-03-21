import mongoose from "mongoose";
import { Curriculum, ICurriculum } from "../models/curriculum.model";
import { NotFoundError, BadRequestError } from "../../../../shared/errors";

export interface CreateCurriculumInput {
  programId: string;
  version: number;
}

export class CurriculumService {
  static async create(data: CreateCurriculumInput): Promise<ICurriculum> {
    const existing = await Curriculum.findOne({
      programId: data.programId,
      version: data.version,
    });
    if (existing) {
      throw new BadRequestError(
        `Curriculum version ${data.version} already exists for this program`
      );
    }
    return Curriculum.create({ ...data, isActive: false });
  }

  /**
   * Atomically deactivate all other curricula for the program and activate this one.
   * Business Rule: A student must follow only one curriculum version.
   */
  static async activate(id: string): Promise<ICurriculum> {
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) throw new NotFoundError("Curriculum not found");

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Deactivate all other active curricula for this program
      await Curriculum.updateMany(
        { programId: curriculum.programId, _id: { $ne: id }, isActive: true },
        { isActive: false },
        { session }
      );

      curriculum.isActive = true;
      await curriculum.save({ session });

      await session.commitTransaction();
      return curriculum;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  static async deactivate(id: string): Promise<ICurriculum> {
    const curriculum = await Curriculum.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!curriculum) throw new NotFoundError("Curriculum not found");
    return curriculum;
  }

  static async findByProgram(programId: string): Promise<ICurriculum[]> {
    return Curriculum.find({ programId }).sort({ version: -1 });
  }

  static async getActive(programId: string): Promise<ICurriculum> {
    const curriculum = await Curriculum.findOne({ programId, isActive: true });
    if (!curriculum) {
      throw new NotFoundError("No active curriculum found for this program");
    }
    return curriculum;
  }

  static async findById(id: string): Promise<ICurriculum> {
    const curriculum = await Curriculum.findById(id);
    if (!curriculum) throw new NotFoundError("Curriculum not found");
    return curriculum;
  }

  static async delete(id: string): Promise<void> {
    const { CourseMapping } = await import("../models/courseMapping.model");
    const linked = await CourseMapping.exists({ curriculumId: id });
    if (linked) {
      throw new BadRequestError(
        "Cannot delete a curriculum that has mapped courses"
      );
    }
    const curriculum = await Curriculum.findByIdAndDelete(id);
    if (!curriculum) throw new NotFoundError("Curriculum not found");
  }
}

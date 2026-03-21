import mongoose from "mongoose";
import {
  StudentCurriculum,
  IStudentCurriculum,
} from "../models/studentCurriculum.model";
import { Curriculum } from "../models/curriculum.model";
import { NotFoundError, BadRequestError } from "../../../../shared/errors";

export class StudentCurriculumService {
  /**
   * Assign a curriculum to a student for a given program.
   * Business Rule: A student must follow only one curriculum version per program.
   * The unique partial index enforces this at DB level; we also check here for a clear error.
   */
  static async assign(
    studentId: string,
    curriculumId: string
  ): Promise<IStudentCurriculum> {
    const curriculum = await Curriculum.findById(curriculumId);
    if (!curriculum) throw new NotFoundError("Curriculum not found");

    const programId = String(curriculum.programId);

    // Check if student already has an active assignment for this program
    const active = await StudentCurriculum.findOne({
      studentId,
      programId,
      isActive: true,
    });
    if (active) {
      throw new BadRequestError(
        "Student already has an active curriculum for this program. Use migrate to switch."
      );
    }

    return StudentCurriculum.create({
      studentId,
      curriculumId,
      programId,
      assignedAt: new Date(),
      isActive: true,
    });
  }

  /**
   * Migrate a student from their current curriculum to a new one.
   * Atomically deactivates the old record and creates the new one.
   */
  static async migrate(
    studentId: string,
    newCurriculumId: string
  ): Promise<IStudentCurriculum> {
    const newCurriculum = await Curriculum.findById(newCurriculumId);
    if (!newCurriculum) throw new NotFoundError("Curriculum not found");

    const programId = String(newCurriculum.programId);

    const current = await StudentCurriculum.findOne({
      studentId,
      programId,
      isActive: true,
    });
    if (!current) {
      throw new NotFoundError(
        "No active curriculum found for this student in this program"
      );
    }

    if (String(current.curriculumId) === newCurriculumId) {
      throw new BadRequestError("Student is already on this curriculum");
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Deactivate current
      current.isActive = false;
      await current.save({ session });

      // Create new assignment with audit trail
      const [newAssignment] = await StudentCurriculum.create(
        [
          {
            studentId,
            curriculumId: newCurriculumId,
            programId,
            assignedAt: new Date(),
            isActive: true,
            migratedFrom: String(current.curriculumId),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return newAssignment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  static async getCurrent(
    studentId: string,
    programId: string
  ): Promise<IStudentCurriculum> {
    const assignment = await StudentCurriculum.findOne({
      studentId,
      programId,
      isActive: true,
    });
    if (!assignment) {
      throw new NotFoundError(
        "No active curriculum found for this student in this program"
      );
    }
    return assignment;
  }

  static async getHistory(
    studentId: string,
    programId: string
  ): Promise<IStudentCurriculum[]> {
    return StudentCurriculum.find({ studentId, programId }).sort({
      assignedAt: -1,
    });
  }
}

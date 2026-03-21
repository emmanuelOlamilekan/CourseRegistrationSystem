"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCurriculumService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const studentCurriculum_model_1 = require("../models/studentCurriculum.model");
const curriculum_model_1 = require("../models/curriculum.model");
const errors_1 = require("../../../../shared/errors");
class StudentCurriculumService {
    /**
     * Assign a curriculum to a student for a given program.
     * Business Rule: A student must follow only one curriculum version per program.
     * The unique partial index enforces this at DB level; we also check here for a clear error.
     */
    static async assign(studentId, curriculumId) {
        const curriculum = await curriculum_model_1.Curriculum.findById(curriculumId);
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        const programId = String(curriculum.programId);
        // Check if student already has an active assignment for this program
        const active = await studentCurriculum_model_1.StudentCurriculum.findOne({
            studentId,
            programId,
            isActive: true,
        });
        if (active) {
            throw new errors_1.BadRequestError("Student already has an active curriculum for this program. Use migrate to switch.");
        }
        return studentCurriculum_model_1.StudentCurriculum.create({
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
    static async migrate(studentId, newCurriculumId) {
        const newCurriculum = await curriculum_model_1.Curriculum.findById(newCurriculumId);
        if (!newCurriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        const programId = String(newCurriculum.programId);
        const current = await studentCurriculum_model_1.StudentCurriculum.findOne({
            studentId,
            programId,
            isActive: true,
        });
        if (!current) {
            throw new errors_1.NotFoundError("No active curriculum found for this student in this program");
        }
        if (String(current.curriculumId) === newCurriculumId) {
            throw new errors_1.BadRequestError("Student is already on this curriculum");
        }
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            // Deactivate current
            current.isActive = false;
            await current.save({ session });
            // Create new assignment with audit trail
            const [newAssignment] = await studentCurriculum_model_1.StudentCurriculum.create([
                {
                    studentId,
                    curriculumId: newCurriculumId,
                    programId,
                    assignedAt: new Date(),
                    isActive: true,
                    migratedFrom: String(current.curriculumId),
                },
            ], { session });
            await session.commitTransaction();
            return newAssignment;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    static async getCurrent(studentId, programId) {
        const assignment = await studentCurriculum_model_1.StudentCurriculum.findOne({
            studentId,
            programId,
            isActive: true,
        });
        if (!assignment) {
            throw new errors_1.NotFoundError("No active curriculum found for this student in this program");
        }
        return assignment;
    }
    static async getHistory(studentId, programId) {
        return studentCurriculum_model_1.StudentCurriculum.find({ studentId, programId }).sort({
            assignedAt: -1,
        });
    }
}
exports.StudentCurriculumService = StudentCurriculumService;

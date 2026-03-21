"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = void 0;
const registration_model_1 = require("../models/registration.model");
const errors_1 = require("../../../../shared/errors");
const publisher_1 = require("../events/publisher");
const curriculum_client_1 = require("../clients/curriculum.client");
class RegistrationService {
    /**
     * Enroll a student in a course.
     *
     * Curriculum rules enforced:
     *  1. Student must have an active curriculum for the program.
     *  2. Course must be mapped in that curriculum (enforces "student follows one curriculum version").
     *  3. All prerequisites for the course must be completed by the student.
     */
    static async enroll(input) {
        const { studentId, courseId, programId } = input;
        // Rule 1: Student must have an active curriculum
        const assignment = await (0, curriculum_client_1.getStudentCurriculum)(studentId, programId);
        const { curriculumId } = assignment;
        // Rule 2: Course must belong to this curriculum
        const mapping = await (0, curriculum_client_1.getCourseMapping)(curriculumId, courseId);
        const { level, semester } = mapping;
        // Rule 3: All prerequisites must be completed
        const prerequisiteIds = await (0, curriculum_client_1.getCoursePrerequisites)(courseId);
        if (prerequisiteIds.length > 0) {
            const completedPrereqs = await registration_model_1.Registration.find({
                studentId,
                courseId: { $in: prerequisiteIds },
                status: "completed",
            }).select("courseId");
            const completedSet = new Set(completedPrereqs.map((r) => r.courseId));
            const missing = prerequisiteIds.filter((id) => !completedSet.has(id));
            if (missing.length > 0) {
                throw new errors_1.BadRequestError(`Prerequisites not completed. Missing course(s): ${missing.join(", ")}`);
            }
        }
        // Check if a non-dropped record already exists for this curriculum version
        const existing = await registration_model_1.Registration.findOne({
            studentId,
            courseId,
            curriculumId,
        });
        if (existing) {
            if (existing.status === "enrolled") {
                throw new errors_1.BadRequestError("Already enrolled in this course");
            }
            if (existing.status === "completed") {
                throw new errors_1.BadRequestError("Course already completed");
            }
            // Re-enroll if previously dropped
            existing.status = "enrolled";
            existing.enrolledAt = new Date();
            existing.droppedAt = undefined;
            await existing.save();
            await publisher_1.EventPublisher.publish("registration.enrolled", {
                studentId,
                courseId,
                programId,
                curriculumId,
                level,
                semester,
            });
            return existing;
        }
        const registration = await registration_model_1.Registration.create({
            studentId,
            courseId,
            programId,
            curriculumId,
            level,
            semester,
        });
        await publisher_1.EventPublisher.publish("registration.enrolled", {
            studentId,
            courseId,
            programId,
            curriculumId,
            level,
            semester,
        });
        return registration;
    }
    /**
     * Drop a course.
     *
     * Curriculum rule enforced:
     *  - Core courses cannot be dropped (they are mandatory for graduation).
     */
    static async drop(studentId, courseId) {
        const registration = await registration_model_1.Registration.findOne({
            studentId,
            courseId,
            status: "enrolled",
        });
        if (!registration)
            throw new errors_1.NotFoundError("Active enrollment not found");
        // Rule: Core courses are mandatory — cannot be dropped
        const mapping = await (0, curriculum_client_1.getCourseMapping)(registration.curriculumId, courseId);
        if (mapping.type === "Core") {
            throw new errors_1.BadRequestError("Core courses are mandatory and cannot be dropped");
        }
        registration.status = "dropped";
        registration.droppedAt = new Date();
        await registration.save();
        await publisher_1.EventPublisher.publish("registration.dropped", {
            studentId,
            courseId,
            programId: registration.programId,
            curriculumId: registration.curriculumId,
        });
        return registration;
    }
    /**
     * Mark a course as completed (e.g. after exam results are recorded).
     * Completed registrations satisfy prerequisite checks for future enrollments.
     */
    static async complete(id) {
        const registration = await registration_model_1.Registration.findById(id);
        if (!registration)
            throw new errors_1.NotFoundError("Registration not found");
        if (registration.status !== "enrolled") {
            throw new errors_1.BadRequestError("Only enrolled registrations can be marked as completed");
        }
        registration.status = "completed";
        registration.completedAt = new Date();
        await registration.save();
        await publisher_1.EventPublisher.publish("registration.completed", {
            studentId: registration.studentId,
            courseId: registration.courseId,
            programId: registration.programId,
            curriculumId: registration.curriculumId,
        });
        return registration;
    }
    static async getStudentRegistrations(studentId, status) {
        const filter = { studentId };
        if (status)
            filter.status = status;
        else
            filter.status = "enrolled";
        return registration_model_1.Registration.find(filter).sort({ enrolledAt: -1 });
    }
    static async getStudentSemesterRegistrations(studentId, programId, level, semester) {
        return registration_model_1.Registration.find({
            studentId,
            programId,
            level,
            semester,
            status: { $in: ["enrolled", "completed"] },
        }).sort({ enrolledAt: 1 });
    }
    static async getCourseEnrollments(courseId) {
        return registration_model_1.Registration.find({ courseId, status: "enrolled" }).sort({
            enrolledAt: 1,
        });
    }
    static async getEnrollmentCount(courseId) {
        return registration_model_1.Registration.countDocuments({ courseId, status: "enrolled" });
    }
    static async getById(id) {
        const registration = await registration_model_1.Registration.findById(id);
        if (!registration)
            throw new errors_1.NotFoundError("Registration not found");
        return registration;
    }
}
exports.RegistrationService = RegistrationService;

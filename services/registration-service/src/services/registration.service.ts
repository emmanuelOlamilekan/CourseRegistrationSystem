import { Registration, IRegistration } from "../models/registration.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";
import { EventPublisher } from "../events/publisher";
import {
  getStudentCurriculum,
  getCourseMapping,
  getCoursePrerequisites,
} from "../clients/curriculum.client";

export interface EnrollInput {
  studentId: string;
  courseId: string;
  programId: string;
}

export class RegistrationService {
  /**
   * Enroll a student in a course.
   *
   * Curriculum rules enforced:
   *  1. Student must have an active curriculum for the program.
   *  2. Course must be mapped in that curriculum (enforces "student follows one curriculum version").
   *  3. All prerequisites for the course must be completed by the student.
   */
  static async enroll(input: EnrollInput): Promise<IRegistration> {
    const { studentId, courseId, programId } = input;

    // Rule 1: Student must have an active curriculum
    const assignment = await getStudentCurriculum(studentId, programId);
    const { curriculumId } = assignment;

    // Rule 2: Course must belong to this curriculum
    const mapping = await getCourseMapping(curriculumId, courseId);
    const { level, semester } = mapping;

    // Rule 3: All prerequisites must be completed
    const prerequisiteIds = await getCoursePrerequisites(courseId);
    if (prerequisiteIds.length > 0) {
      const completedPrereqs = await Registration.find({
        studentId,
        courseId: { $in: prerequisiteIds },
        status: "completed",
      }).select("courseId");

      const completedSet = new Set(completedPrereqs.map((r) => r.courseId));
      const missing = prerequisiteIds.filter((id) => !completedSet.has(id));

      if (missing.length > 0) {
        throw new BadRequestError(
          `Prerequisites not completed. Missing course(s): ${missing.join(", ")}`
        );
      }
    }

    // Check if a non-dropped record already exists for this curriculum version
    const existing = await Registration.findOne({
      studentId,
      courseId,
      curriculumId,
    });

    if (existing) {
      if (existing.status === "enrolled") {
        throw new BadRequestError("Already enrolled in this course");
      }
      if (existing.status === "completed") {
        throw new BadRequestError("Course already completed");
      }
      // Re-enroll if previously dropped
      existing.status = "enrolled";
      existing.enrolledAt = new Date();
      existing.droppedAt = undefined;
      await existing.save();
      await EventPublisher.publish("registration.enrolled", {
        studentId,
        courseId,
        programId,
        curriculumId,
        level,
        semester,
      });
      return existing;
    }

    const registration = await Registration.create({
      studentId,
      courseId,
      programId,
      curriculumId,
      level,
      semester,
    });

    await EventPublisher.publish("registration.enrolled", {
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
  static async drop(studentId: string, courseId: string): Promise<IRegistration> {
    const registration = await Registration.findOne({
      studentId,
      courseId,
      status: "enrolled",
    });
    if (!registration) throw new NotFoundError("Active enrollment not found");

    // Rule: Core courses are mandatory — cannot be dropped
    const mapping = await getCourseMapping(
      registration.curriculumId,
      courseId
    );
    if (mapping.type === "Core") {
      throw new BadRequestError(
        "Core courses are mandatory and cannot be dropped"
      );
    }

    registration.status = "dropped";
    registration.droppedAt = new Date();
    await registration.save();

    await EventPublisher.publish("registration.dropped", {
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
  static async complete(id: string): Promise<IRegistration> {
    const registration = await Registration.findById(id);
    if (!registration) throw new NotFoundError("Registration not found");
    if (registration.status !== "enrolled") {
      throw new BadRequestError(
        "Only enrolled registrations can be marked as completed"
      );
    }

    registration.status = "completed";
    registration.completedAt = new Date();
    await registration.save();

    await EventPublisher.publish("registration.completed", {
      studentId: registration.studentId,
      courseId: registration.courseId,
      programId: registration.programId,
      curriculumId: registration.curriculumId,
    });

    return registration;
  }

  static async getStudentRegistrations(
    studentId: string,
    status?: string
  ): Promise<IRegistration[]> {
    const filter: Record<string, unknown> = { studentId };
    if (status) filter.status = status;
    else filter.status = "enrolled";
    return Registration.find(filter).sort({ enrolledAt: -1 });
  }

  static async getStudentSemesterRegistrations(
    studentId: string,
    programId: string,
    level: number,
    semester: number
  ): Promise<IRegistration[]> {
    return Registration.find({
      studentId,
      programId,
      level,
      semester,
      status: { $in: ["enrolled", "completed"] },
    }).sort({ enrolledAt: 1 });
  }

  static async getCourseEnrollments(courseId: string): Promise<IRegistration[]> {
    return Registration.find({ courseId, status: "enrolled" }).sort({
      enrolledAt: 1,
    });
  }

  static async getEnrollmentCount(courseId: string): Promise<number> {
    return Registration.countDocuments({ courseId, status: "enrolled" });
  }

  static async getById(id: string): Promise<IRegistration> {
    const registration = await Registration.findById(id);
    if (!registration) throw new NotFoundError("Registration not found");
    return registration;
  }
}

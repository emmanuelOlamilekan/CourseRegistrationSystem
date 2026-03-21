import { Request, Response } from "express";
import { RegistrationService } from "../services/registration.service";

export class RegistrationController {
  static async enroll(req: Request, res: Response) {
    const { courseId, programId } = req.body;
    const studentId = req.user!.userId;
    const registration = await RegistrationService.enroll({
      studentId,
      courseId,
      programId,
    });
    res.status(201).json({ success: true, data: registration });
  }

  static async drop(req: Request, res: Response) {
    const { courseId } = req.body;
    const studentId = req.user!.userId;
    const registration = await RegistrationService.drop(studentId, courseId);
    res.json({ success: true, data: registration });
  }

  static async complete(req: Request, res: Response) {
    const registration = await RegistrationService.complete(
      String(req.params.id)
    );
    res.json({ success: true, data: registration });
  }

  static async getMyRegistrations(req: Request, res: Response) {
    const studentId = req.user!.userId;
    const { status } = req.query as { status?: string };
    const registrations = await RegistrationService.getStudentRegistrations(
      studentId,
      status
    );
    res.json({ success: true, data: registrations });
  }

  static async getMySemesterRegistrations(req: Request, res: Response) {
    const studentId = req.user!.userId;
    const { programId, level, semester } = req.params;
    const registrations =
      await RegistrationService.getStudentSemesterRegistrations(
        studentId,
        String(programId),
        Number(level),
        Number(semester)
      );
    res.json({ success: true, data: registrations });
  }

  static async getCourseEnrollments(req: Request, res: Response) {
    const registrations = await RegistrationService.getCourseEnrollments(
      String(req.params.courseId)
    );
    res.json({ success: true, data: registrations });
  }

  static async getEnrollmentCount(req: Request, res: Response) {
    const count = await RegistrationService.getEnrollmentCount(
      String(req.params.courseId)
    );
    res.json({ success: true, data: { count } });
  }

  static async getById(req: Request, res: Response) {
    const registration = await RegistrationService.getById(
      String(req.params.id)
    );
    res.json({ success: true, data: registration });
  }
}

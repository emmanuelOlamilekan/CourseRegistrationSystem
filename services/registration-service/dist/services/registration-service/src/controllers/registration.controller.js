"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const registration_service_1 = require("../services/registration.service");
class RegistrationController {
    static async enroll(req, res) {
        const { courseId, programId } = req.body;
        const studentId = req.user.userId;
        const registration = await registration_service_1.RegistrationService.enroll({
            studentId,
            courseId,
            programId,
        });
        res.status(201).json({ success: true, data: registration });
    }
    static async drop(req, res) {
        const { courseId } = req.body;
        const studentId = req.user.userId;
        const registration = await registration_service_1.RegistrationService.drop(studentId, courseId);
        res.json({ success: true, data: registration });
    }
    static async complete(req, res) {
        const registration = await registration_service_1.RegistrationService.complete(String(req.params.id));
        res.json({ success: true, data: registration });
    }
    static async getMyRegistrations(req, res) {
        const studentId = req.user.userId;
        const { status } = req.query;
        const registrations = await registration_service_1.RegistrationService.getStudentRegistrations(studentId, status);
        res.json({ success: true, data: registrations });
    }
    static async getMySemesterRegistrations(req, res) {
        const studentId = req.user.userId;
        const { programId, level, semester } = req.params;
        const registrations = await registration_service_1.RegistrationService.getStudentSemesterRegistrations(studentId, String(programId), Number(level), Number(semester));
        res.json({ success: true, data: registrations });
    }
    static async getCourseEnrollments(req, res) {
        const registrations = await registration_service_1.RegistrationService.getCourseEnrollments(String(req.params.courseId));
        res.json({ success: true, data: registrations });
    }
    static async getEnrollmentCount(req, res) {
        const count = await registration_service_1.RegistrationService.getEnrollmentCount(String(req.params.courseId));
        res.json({ success: true, data: { count } });
    }
    static async getById(req, res) {
        const registration = await registration_service_1.RegistrationService.getById(String(req.params.id));
        res.json({ success: true, data: registration });
    }
}
exports.RegistrationController = RegistrationController;

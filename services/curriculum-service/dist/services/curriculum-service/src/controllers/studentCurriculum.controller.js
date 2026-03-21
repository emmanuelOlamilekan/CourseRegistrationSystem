"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGraduation = exports.getCurriculumHistory = exports.getCurrentCurriculum = exports.migrateCurriculum = exports.assignCurriculum = void 0;
const studentCurriculum_service_1 = require("../services/studentCurriculum.service");
const graduation_service_1 = require("../services/graduation.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.assignCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, curriculumId } = req.body;
    const assignment = await studentCurriculum_service_1.StudentCurriculumService.assign(studentId, curriculumId);
    res.status(201).json({ success: true, data: assignment });
});
exports.migrateCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, newCurriculumId } = req.body;
    const assignment = await studentCurriculum_service_1.StudentCurriculumService.migrate(studentId, newCurriculumId);
    res.json({ success: true, data: assignment });
});
exports.getCurrentCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, programId } = req.params;
    const assignment = await studentCurriculum_service_1.StudentCurriculumService.getCurrent(String(studentId), String(programId));
    res.json({ success: true, data: assignment });
});
exports.getCurriculumHistory = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, programId } = req.params;
    const history = await studentCurriculum_service_1.StudentCurriculumService.getHistory(String(studentId), String(programId));
    res.json({ success: true, data: history });
});
exports.checkGraduation = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, programId, completedCourseIds } = req.body;
    const result = await graduation_service_1.GraduationService.checkEligibility(studentId, programId, completedCourseIds);
    res.json({ success: true, data: result });
});

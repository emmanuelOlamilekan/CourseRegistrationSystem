"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreditUnits = exports.removeCourseMapping = exports.updateCourseMapping = exports.getCourseMappings = exports.addCourseMapping = void 0;
const courseMapping_service_1 = require("../services/courseMapping.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.addCourseMapping = (0, asyncHandler_1.default)(async (req, res) => {
    const mapping = await courseMapping_service_1.CourseMappingService.addCourse({
        curriculumId: String(req.params.curriculumId),
        ...req.body,
    });
    res.status(201).json({ success: true, data: mapping });
});
exports.getCourseMappings = (0, asyncHandler_1.default)(async (req, res) => {
    const { level, semester } = req.query;
    if (level && semester) {
        const mappings = await courseMapping_service_1.CourseMappingService.getSemesterCourses(String(req.params.curriculumId), Number(level), Number(semester));
        return res.json({ success: true, data: mappings });
    }
    if (level) {
        const mappings = await courseMapping_service_1.CourseMappingService.findByLevel(String(req.params.curriculumId), Number(level));
        return res.json({ success: true, data: mappings });
    }
    const mappings = await courseMapping_service_1.CourseMappingService.findByCurriculum(String(req.params.curriculumId));
    res.json({ success: true, data: mappings });
});
exports.updateCourseMapping = (0, asyncHandler_1.default)(async (req, res) => {
    const mapping = await courseMapping_service_1.CourseMappingService.updateCourse(String(req.params.id), req.body);
    res.json({ success: true, data: mapping });
});
exports.removeCourseMapping = (0, asyncHandler_1.default)(async (req, res) => {
    await courseMapping_service_1.CourseMappingService.removeCourse(String(req.params.id));
    res.status(204).send();
});
exports.getCreditUnits = (0, asyncHandler_1.default)(async (req, res) => {
    const { type } = req.query;
    const total = await courseMapping_service_1.CourseMappingService.getTotalCreditUnits(String(req.params.curriculumId), type);
    res.json({ success: true, data: { total } });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePrerequisite = exports.getAllPrerequisites = exports.getPrerequisites = exports.addPrerequisite = void 0;
const prerequisite_service_1 = require("../services/prerequisite.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.addPrerequisite = (0, asyncHandler_1.default)(async (req, res) => {
    const { courseId, requiredCourseId } = req.body;
    const prereq = await prerequisite_service_1.PrerequisiteService.add(courseId, requiredCourseId);
    res.status(201).json({ success: true, data: prereq });
});
exports.getPrerequisites = (0, asyncHandler_1.default)(async (req, res) => {
    const prereqs = await prerequisite_service_1.PrerequisiteService.getForCourse(String(req.params.courseId));
    res.json({ success: true, data: prereqs });
});
exports.getAllPrerequisites = (0, asyncHandler_1.default)(async (req, res) => {
    const prereqs = await prerequisite_service_1.PrerequisiteService.getAllPrerequisites(String(req.params.courseId));
    res.json({ success: true, data: prereqs });
});
exports.removePrerequisite = (0, asyncHandler_1.default)(async (req, res) => {
    const { courseId, requiredCourseId } = req.body;
    await prerequisite_service_1.PrerequisiteService.remove(courseId, requiredCourseId);
    res.status(204).send();
});

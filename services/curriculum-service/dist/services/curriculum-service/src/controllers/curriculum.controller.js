"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCurriculum = exports.deactivateCurriculum = exports.activateCurriculum = exports.getCurriculumById = exports.getActiveCurriculum = exports.getCurriculaByProgram = exports.createCurriculum = void 0;
const curriculum_service_1 = require("../services/curriculum.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.createCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const curriculum = await curriculum_service_1.CurriculumService.create(req.body);
    res.status(201).json({ success: true, data: curriculum });
});
exports.getCurriculaByProgram = (0, asyncHandler_1.default)(async (req, res) => {
    const curricula = await curriculum_service_1.CurriculumService.findByProgram(String(req.params.programId));
    res.json({ success: true, data: curricula });
});
exports.getActiveCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const curriculum = await curriculum_service_1.CurriculumService.getActive(String(req.params.programId));
    res.json({ success: true, data: curriculum });
});
exports.getCurriculumById = (0, asyncHandler_1.default)(async (req, res) => {
    const curriculum = await curriculum_service_1.CurriculumService.findById(String(req.params.id));
    res.json({ success: true, data: curriculum });
});
exports.activateCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const curriculum = await curriculum_service_1.CurriculumService.activate(String(req.params.id));
    res.json({ success: true, data: curriculum });
});
exports.deactivateCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    const curriculum = await curriculum_service_1.CurriculumService.deactivate(String(req.params.id));
    res.json({ success: true, data: curriculum });
});
exports.deleteCurriculum = (0, asyncHandler_1.default)(async (req, res) => {
    await curriculum_service_1.CurriculumService.delete(String(req.params.id));
    res.status(204).send();
});

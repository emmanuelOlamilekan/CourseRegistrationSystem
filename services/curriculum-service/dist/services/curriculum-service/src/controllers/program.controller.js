"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProgram = exports.updateProgram = exports.getProgramById = exports.getPrograms = exports.createProgram = void 0;
const program_service_1 = require("../services/program.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.createProgram = (0, asyncHandler_1.default)(async (req, res) => {
    const program = await program_service_1.ProgramService.create(req.body);
    res.status(201).json({ success: true, data: program });
});
exports.getPrograms = (0, asyncHandler_1.default)(async (req, res) => {
    const { departmentId, isActive } = req.query;
    const query = {};
    if (departmentId)
        query.departmentId = String(departmentId);
    if (isActive !== undefined)
        query.isActive = isActive === "true";
    const result = await program_service_1.ProgramService.findAll(query);
    res.json({ success: true, ...result });
});
exports.getProgramById = (0, asyncHandler_1.default)(async (req, res) => {
    const program = await program_service_1.ProgramService.findById(String(req.params.id));
    res.json({ success: true, data: program });
});
exports.updateProgram = (0, asyncHandler_1.default)(async (req, res) => {
    const program = await program_service_1.ProgramService.update(String(req.params.id), req.body);
    res.json({ success: true, data: program });
});
exports.deleteProgram = (0, asyncHandler_1.default)(async (req, res) => {
    await program_service_1.ProgramService.delete(String(req.params.id));
    res.status(204).send();
});

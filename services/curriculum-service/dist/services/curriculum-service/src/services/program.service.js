"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramService = void 0;
const program_model_1 = require("../models/program.model");
const errors_1 = require("../../../../shared/errors");
class ProgramService {
    static async create(data) {
        const existing = await program_model_1.Program.findOne({
            departmentId: data.departmentId,
            name: data.name,
        });
        if (existing) {
            throw new errors_1.BadRequestError(`A program named "${data.name}" already exists in this department`);
        }
        return program_model_1.Program.create(data);
    }
    static async findAll(query = {}) {
        const filter = {};
        if (query.departmentId)
            filter.departmentId = query.departmentId;
        if (query.isActive !== undefined)
            filter.isActive = query.isActive;
        const [programs, total] = await Promise.all([
            program_model_1.Program.find(filter).sort({ name: 1 }),
            program_model_1.Program.countDocuments(filter),
        ]);
        return { programs, total };
    }
    static async findById(id) {
        const program = await program_model_1.Program.findById(id);
        if (!program)
            throw new errors_1.NotFoundError("Program not found");
        return program;
    }
    static async update(id, data) {
        const program = await program_model_1.Program.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!program)
            throw new errors_1.NotFoundError("Program not found");
        return program;
    }
    static async delete(id) {
        const { Curriculum } = await Promise.resolve().then(() => __importStar(require("../models/curriculum.model")));
        const linked = await Curriculum.exists({ programId: id });
        if (linked) {
            throw new errors_1.BadRequestError("Cannot delete a program that has associated curricula");
        }
        const program = await program_model_1.Program.findByIdAndDelete(id);
        if (!program)
            throw new errors_1.NotFoundError("Program not found");
    }
}
exports.ProgramService = ProgramService;

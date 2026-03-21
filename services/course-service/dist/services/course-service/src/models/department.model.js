"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const departmentSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    facultyId: {
        type: String, // referencing Faculty
        required: true
    }
}, { timestamps: true });
// Indexes
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ facultyId: 1 });
exports.Department = mongoose_1.default.model("Department", departmentSchema);

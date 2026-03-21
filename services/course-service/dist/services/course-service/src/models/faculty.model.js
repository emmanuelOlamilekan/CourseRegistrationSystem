"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faculty = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const facultySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });
// Indexes
facultySchema.index({ name: 1 }, { unique: true });
facultySchema.index({ code: 1 }, { unique: true });
exports.Faculty = mongoose_1.default.model("Faculty", facultySchema);

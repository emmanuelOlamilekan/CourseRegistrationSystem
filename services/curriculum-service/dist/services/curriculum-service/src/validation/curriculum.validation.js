"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurriculumSchema = void 0;
const zod_1 = require("zod");
exports.createCurriculumSchema = zod_1.z.object({
    programId: zod_1.z.string().min(1, "Program ID is required"),
    version: zod_1.z.number().int().min(1),
});

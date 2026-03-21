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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const curriculum_model_1 = require("../models/curriculum.model");
const errors_1 = require("../../../../shared/errors");
class CurriculumService {
    static async create(data) {
        const existing = await curriculum_model_1.Curriculum.findOne({
            programId: data.programId,
            version: data.version,
        });
        if (existing) {
            throw new errors_1.BadRequestError(`Curriculum version ${data.version} already exists for this program`);
        }
        return curriculum_model_1.Curriculum.create({ ...data, isActive: false });
    }
    /**
     * Atomically deactivate all other curricula for the program and activate this one.
     * Business Rule: A student must follow only one curriculum version.
     */
    static async activate(id) {
        const curriculum = await curriculum_model_1.Curriculum.findById(id);
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            // Deactivate all other active curricula for this program
            await curriculum_model_1.Curriculum.updateMany({ programId: curriculum.programId, _id: { $ne: id }, isActive: true }, { isActive: false }, { session });
            curriculum.isActive = true;
            await curriculum.save({ session });
            await session.commitTransaction();
            return curriculum;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    static async deactivate(id) {
        const curriculum = await curriculum_model_1.Curriculum.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        return curriculum;
    }
    static async findByProgram(programId) {
        return curriculum_model_1.Curriculum.find({ programId }).sort({ version: -1 });
    }
    static async getActive(programId) {
        const curriculum = await curriculum_model_1.Curriculum.findOne({ programId, isActive: true });
        if (!curriculum) {
            throw new errors_1.NotFoundError("No active curriculum found for this program");
        }
        return curriculum;
    }
    static async findById(id) {
        const curriculum = await curriculum_model_1.Curriculum.findById(id);
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
        return curriculum;
    }
    static async delete(id) {
        const { CourseMapping } = await Promise.resolve().then(() => __importStar(require("../models/courseMapping.model")));
        const linked = await CourseMapping.exists({ curriculumId: id });
        if (linked) {
            throw new errors_1.BadRequestError("Cannot delete a curriculum that has mapped courses");
        }
        const curriculum = await curriculum_model_1.Curriculum.findByIdAndDelete(id);
        if (!curriculum)
            throw new errors_1.NotFoundError("Curriculum not found");
    }
}
exports.CurriculumService = CurriculumService;

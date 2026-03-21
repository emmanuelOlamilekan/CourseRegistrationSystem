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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "lecturer", "course_advisor", "admin"],
        required: true
    },
    facultyId: {
        type: String,
        index: true
    },
    departmentId: {
        type: String,
        index: true
    },
    // 🎓 Student only
    matricNumber: {
        type: String,
        unique: true,
        sparse: true // allows null for non-students
    },
    // 👨‍🏫 Staff only
    staffId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Lecturer responsibility
    isLevelAdvisor: {
        type: Boolean,
        default: false
    },
    levelAdvising: [
        {
            type: Number
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
//
// 🔥 Indexes
//
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ matricNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ staffId: 1 }, { unique: true, sparse: true });
exports.User = mongoose_1.default.model("User", userSchema);

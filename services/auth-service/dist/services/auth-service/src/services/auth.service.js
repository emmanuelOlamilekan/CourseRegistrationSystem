"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
const token_1 = require("../utils/token");
const errors_1 = require("../utils/errors");
class AuthService {
    static async register(email, password, role) {
        const existingUser = await user_model_1.User.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
        });
        if (existingUser) {
            throw new errors_1.BadRequestError("User already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await user_model_1.User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
        });
        return { _id: user._id, email: user.email, role: user.role };
    }
    static async login(email, password) {
        const user = await user_model_1.User.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
        });
        if (!user)
            throw new errors_1.UnauthorizedError("Invalid credentials");
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            throw new errors_1.UnauthorizedError("Invalid credentials");
        const payload = { userId: user._id.toString(), role: user.role };
        return {
            accessToken: (0, token_1.generateAccessToken)(payload),
            refreshToken: (0, token_1.generateRefreshToken)(payload),
        };
    }
}
exports.AuthService = AuthService;

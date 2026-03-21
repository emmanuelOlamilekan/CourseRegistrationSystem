"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_validation_1 = require("../validation/auth.validation");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post("/register", authLimiter, (0, validate_middleware_1.validate)(auth_validation_1.registerSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.register));
router.post("/login", authLimiter, (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.login));
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_validation_1 = require("../validation/user.validation");
const router = (0, express_1.Router)();
// Authenticated user — own profile
router.get("/me", (0, auth_middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.getMe));
router.patch("/me", (0, auth_middleware_1.authMiddleware)(), (0, validate_middleware_1.validate)(user_validation_1.updateProfileSchema), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.updateMe));
// Lookups (any authenticated user)
router.get("/faculty/:facultyId", (0, auth_middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.findByFaculty));
router.get("/department/:departmentId", (0, auth_middleware_1.authMiddleware)(), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.findByDepartment));
// Admin routes
router.get("/", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.findAll));
router.post("/", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(user_validation_1.createUserSchema), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.create));
router.get("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.findById));
router.patch("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(user_validation_1.adminUpdateSchema), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.updateById));
router.delete("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(user_controller_1.UserController.deactivate));
exports.default = router;

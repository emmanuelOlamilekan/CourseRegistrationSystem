"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("../controllers/registration.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const registration_validation_1 = require("../validation/registration.validation");
const router = (0, express_1.Router)();
// Student routes
router.post("/enroll", (0, auth_middleware_1.authMiddleware)(["student"]), (0, validate_middleware_1.validate)(registration_validation_1.enrollSchema), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.enroll));
router.post("/drop", (0, auth_middleware_1.authMiddleware)(["student"]), (0, validate_middleware_1.validate)(registration_validation_1.dropSchema), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.drop));
router.get("/my", (0, auth_middleware_1.authMiddleware)(["student"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.getMyRegistrations));
router.get("/my/:programId/level/:level/semester/:semester", (0, auth_middleware_1.authMiddleware)(["student"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.getMySemesterRegistrations));
// Lecturer + Admin routes
router.get("/course/:courseId", (0, auth_middleware_1.authMiddleware)(["lecturer", "admin", "course_advisor"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.getCourseEnrollments));
router.get("/course/:courseId/count", (0, auth_middleware_1.authMiddleware)(["lecturer", "admin", "course_advisor"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.getEnrollmentCount));
// Admin / course_advisor routes
router.patch("/:id/complete", (0, auth_middleware_1.authMiddleware)(["admin", "course_advisor"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.complete));
router.get("/:id", (0, auth_middleware_1.authMiddleware)(["admin", "course_advisor"]), (0, asyncHandler_1.asyncHandler)(registration_controller_1.RegistrationController.getById));
exports.default = router;

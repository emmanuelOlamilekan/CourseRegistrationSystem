"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const course_validation_1 = require("../validation/course.validation");
const router = (0, express_1.Router)();
// Public
router.get("/", (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.findAll));
router.get("/code/:code", (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.findByCode));
router.get("/department/:departmentId", (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.findByDepartment));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.findById));
// Lecturer + Admin
router.post("/", (0, auth_middleware_1.authMiddleware)(["lecturer", "admin"]), (0, validate_middleware_1.validate)(course_validation_1.createCourseSchema), (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.create));
router.patch("/:id", (0, auth_middleware_1.authMiddleware)(["lecturer", "admin"]), (0, validate_middleware_1.validate)(course_validation_1.updateCourseSchema), (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.update));
// Admin only
router.delete("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(course_controller_1.CourseController.delete));
exports.default = router;

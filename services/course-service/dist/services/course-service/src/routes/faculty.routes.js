"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faculty_controller_1 = require("../controllers/faculty.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const faculty_validation_1 = require("../validation/faculty.validation");
const router = (0, express_1.Router)();
// Public
router.get("/", (0, asyncHandler_1.asyncHandler)(faculty_controller_1.FacultyController.findAll));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(faculty_controller_1.FacultyController.findById));
// Admin only
router.post("/", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(faculty_validation_1.createFacultySchema), (0, asyncHandler_1.asyncHandler)(faculty_controller_1.FacultyController.create));
router.patch("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(faculty_validation_1.updateFacultySchema), (0, asyncHandler_1.asyncHandler)(faculty_controller_1.FacultyController.update));
router.delete("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(faculty_controller_1.FacultyController.delete));
exports.default = router;

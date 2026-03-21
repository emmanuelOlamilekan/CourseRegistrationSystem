"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const department_validation_1 = require("../validation/department.validation");
const router = (0, express_1.Router)();
// Public
router.get("/", (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.findAll));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.findById));
router.get("/faculty/:facultyId", (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.findByFaculty));
// Admin only
router.post("/", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(department_validation_1.createDepartmentSchema), (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.create));
router.patch("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, validate_middleware_1.validate)(department_validation_1.updateDepartmentSchema), (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.update));
router.delete("/:id", (0, auth_middleware_1.authMiddleware)(["admin"]), (0, asyncHandler_1.asyncHandler)(department_controller_1.DepartmentController.delete));
exports.default = router;

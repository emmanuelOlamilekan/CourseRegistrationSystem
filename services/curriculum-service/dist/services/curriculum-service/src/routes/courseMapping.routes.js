"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseMapping_controller_1 = require("../controllers/courseMapping.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const courseMapping_validation_1 = require("../validation/courseMapping.validation");
const router = (0, express_1.Router)({ mergeParams: true });
// Public reads (nested under /curricula/:curriculumId/courses)
router.get("/", courseMapping_controller_1.getCourseMappings);
router.get("/credits", courseMapping_controller_1.getCreditUnits);
// Admin only mutations
router.use((0, auth_middleware_1.authMiddleware)(["admin"]));
router.post("/", (0, validate_middleware_1.validate)(courseMapping_validation_1.addCourseMappingSchema), courseMapping_controller_1.addCourseMapping);
router.patch("/:id", (0, validate_middleware_1.validate)(courseMapping_validation_1.updateCourseMappingSchema), courseMapping_controller_1.updateCourseMapping);
router.delete("/:id", courseMapping_controller_1.removeCourseMapping);
exports.default = router;

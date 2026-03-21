"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prerequisite_controller_1 = require("../controllers/prerequisite.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const prerequisite_validation_1 = require("../validation/prerequisite.validation");
const router = (0, express_1.Router)();
// Public reads
router.get("/:courseId", prerequisite_controller_1.getPrerequisites);
router.get("/:courseId/all", prerequisite_controller_1.getAllPrerequisites);
// Admin only mutations
router.use((0, auth_middleware_1.authMiddleware)(["admin"]));
router.post("/", (0, validate_middleware_1.validate)(prerequisite_validation_1.addPrerequisiteSchema), prerequisite_controller_1.addPrerequisite);
router.delete("/", prerequisite_controller_1.removePrerequisite);
exports.default = router;

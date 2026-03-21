"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const curriculum_controller_1 = require("../controllers/curriculum.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const curriculum_validation_1 = require("../validation/curriculum.validation");
const router = (0, express_1.Router)();
// Public reads
router.get("/program/:programId", curriculum_controller_1.getCurriculaByProgram);
router.get("/program/:programId/active", curriculum_controller_1.getActiveCurriculum);
router.get("/:id", curriculum_controller_1.getCurriculumById);
// Admin only mutations
router.use((0, auth_middleware_1.authMiddleware)(["admin"]));
router.post("/", (0, validate_middleware_1.validate)(curriculum_validation_1.createCurriculumSchema), curriculum_controller_1.createCurriculum);
router.patch("/:id/activate", curriculum_controller_1.activateCurriculum);
router.patch("/:id/deactivate", curriculum_controller_1.deactivateCurriculum);
router.delete("/:id", curriculum_controller_1.deleteCurriculum);
exports.default = router;

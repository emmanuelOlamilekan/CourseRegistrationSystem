import { Router } from "express";
import {
  assignCurriculum,
  migrateCurriculum,
  getCurrentCurriculum,
  getCurriculumHistory,
  checkGraduation,
} from "../controllers/studentCurriculum.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  assignCurriculumSchema,
  migrateCurriculumSchema,
  graduationCheckSchema,
} from "../validation/studentCurriculum.validation";

const router = Router();

router.use(authMiddleware(["admin", "course_advisor", "student"]));

router.post("/assign", validate(assignCurriculumSchema), assignCurriculum);
router.post("/migrate", validate(migrateCurriculumSchema), migrateCurriculum);
router.post(
  "/graduation-check",
  validate(graduationCheckSchema),
  checkGraduation
);
router.get("/:studentId/:programId", getCurrentCurriculum);
router.get("/:studentId/:programId/history", getCurriculumHistory);

export default router;

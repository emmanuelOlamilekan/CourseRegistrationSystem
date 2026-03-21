import { Router } from "express";
import {
  createCurriculum,
  getCurriculaByProgram,
  getActiveCurriculum,
  getCurriculumById,
  activateCurriculum,
  deactivateCurriculum,
  deleteCurriculum,
} from "../controllers/curriculum.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createCurriculumSchema } from "../validation/curriculum.validation";

const router = Router();

// Public reads
router.get("/program/:programId", getCurriculaByProgram);
router.get("/program/:programId/active", getActiveCurriculum);
router.get("/:id", getCurriculumById);

// Admin only mutations
router.use(authMiddleware(["admin"]));
router.post("/", validate(createCurriculumSchema), createCurriculum);
router.patch("/:id/activate", activateCurriculum);
router.patch("/:id/deactivate", deactivateCurriculum);
router.delete("/:id", deleteCurriculum);

export default router;

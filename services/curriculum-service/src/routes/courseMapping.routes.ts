import { Router } from "express";
import {
  addCourseMapping,
  getCourseMappings,
  updateCourseMapping,
  removeCourseMapping,
  getCreditUnits,
} from "../controllers/courseMapping.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  addCourseMappingSchema,
  updateCourseMappingSchema,
} from "../validation/courseMapping.validation";

const router = Router({ mergeParams: true });

// Public reads (nested under /curricula/:curriculumId/courses)
router.get("/", getCourseMappings);
router.get("/credits", getCreditUnits);

// Admin only mutations
router.use(authMiddleware(["admin"]));
router.post("/", validate(addCourseMappingSchema), addCourseMapping);
router.patch("/:id", validate(updateCourseMappingSchema), updateCourseMapping);
router.delete("/:id", removeCourseMapping);

export default router;

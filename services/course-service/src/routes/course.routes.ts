import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createCourseSchema, updateCourseSchema } from "../validation/course.validation";

const router = Router();

// Public
router.get("/", asyncHandler(CourseController.findAll));
router.get("/code/:code", asyncHandler(CourseController.findByCode));
router.get("/department/:departmentId", asyncHandler(CourseController.findByDepartment));
router.get("/:id", asyncHandler(CourseController.findById));

// Lecturer + Admin
router.post(
  "/",
  authMiddleware(["lecturer", "admin"]),
  validate(createCourseSchema),
  asyncHandler(CourseController.create)
);
router.patch(
  "/:id",
  authMiddleware(["lecturer", "admin"]),
  validate(updateCourseSchema),
  asyncHandler(CourseController.update)
);

// Admin only
router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(CourseController.delete)
);

export default router;

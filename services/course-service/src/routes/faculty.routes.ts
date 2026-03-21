import { Router } from "express";
import { FacultyController } from "../controllers/faculty.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createFacultySchema, updateFacultySchema } from "../validation/faculty.validation";

const router = Router();

// Public
router.get("/", asyncHandler(FacultyController.findAll));
router.get("/:id", asyncHandler(FacultyController.findById));

// Admin only
router.post(
  "/",
  authMiddleware(["admin"]),
  validate(createFacultySchema),
  asyncHandler(FacultyController.create)
);
router.patch(
  "/:id",
  authMiddleware(["admin"]),
  validate(updateFacultySchema),
  asyncHandler(FacultyController.update)
);
router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(FacultyController.delete)
);

export default router;

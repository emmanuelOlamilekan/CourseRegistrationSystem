import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createDepartmentSchema, updateDepartmentSchema } from "../validation/department.validation";

const router = Router();

// Public
router.get("/", asyncHandler(DepartmentController.findAll));
router.get("/:id", asyncHandler(DepartmentController.findById));
router.get("/faculty/:facultyId", asyncHandler(DepartmentController.findByFaculty));

// Admin only
router.post(
  "/",
  authMiddleware(["admin"]),
  validate(createDepartmentSchema),
  asyncHandler(DepartmentController.create)
);
router.patch(
  "/:id",
  authMiddleware(["admin"]),
  validate(updateDepartmentSchema),
  asyncHandler(DepartmentController.update)
);
router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(DepartmentController.delete)
);

export default router;

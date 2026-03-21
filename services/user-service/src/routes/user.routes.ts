import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createUserSchema,
  updateProfileSchema,
  adminUpdateSchema,
} from "../validation/user.validation";

const router = Router();

// Authenticated user — own profile
router.get("/me", authMiddleware(), asyncHandler(UserController.getMe));
router.patch(
  "/me",
  authMiddleware(),
  validate(updateProfileSchema),
  asyncHandler(UserController.updateMe)
);

// Lookups (any authenticated user)
router.get(
  "/faculty/:facultyId",
  authMiddleware(),
  asyncHandler(UserController.findByFaculty)
);
router.get(
  "/department/:departmentId",
  authMiddleware(),
  asyncHandler(UserController.findByDepartment)
);

// Admin routes
router.get(
  "/",
  authMiddleware(["admin"]),
  asyncHandler(UserController.findAll)
);
router.post(
  "/",
  authMiddleware(["admin"]),
  validate(createUserSchema),
  asyncHandler(UserController.create)
);
router.get(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(UserController.findById)
);
router.patch(
  "/:id",
  authMiddleware(["admin"]),
  validate(adminUpdateSchema),
  asyncHandler(UserController.updateById)
);
router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(UserController.deactivate)
);

export default router;

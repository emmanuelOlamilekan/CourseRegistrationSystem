import { Router } from "express";
import { RegistrationController } from "../controllers/registration.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { enrollSchema, dropSchema } from "../validation/registration.validation";

const router = Router();

// Student routes
router.post(
  "/enroll",
  authMiddleware(["student"]),
  validate(enrollSchema),
  asyncHandler(RegistrationController.enroll)
);
router.post(
  "/drop",
  authMiddleware(["student"]),
  validate(dropSchema),
  asyncHandler(RegistrationController.drop)
);
router.get(
  "/my",
  authMiddleware(["student"]),
  asyncHandler(RegistrationController.getMyRegistrations)
);
router.get(
  "/my/:programId/level/:level/semester/:semester",
  authMiddleware(["student"]),
  asyncHandler(RegistrationController.getMySemesterRegistrations)
);

// Lecturer + Admin routes
router.get(
  "/course/:courseId",
  authMiddleware(["lecturer", "admin", "course_advisor"]),
  asyncHandler(RegistrationController.getCourseEnrollments)
);
router.get(
  "/course/:courseId/count",
  authMiddleware(["lecturer", "admin", "course_advisor"]),
  asyncHandler(RegistrationController.getEnrollmentCount)
);

// Admin / course_advisor routes
router.patch(
  "/:id/complete",
  authMiddleware(["admin", "course_advisor"]),
  asyncHandler(RegistrationController.complete)
);
router.get(
  "/:id",
  authMiddleware(["admin", "course_advisor"]),
  asyncHandler(RegistrationController.getById)
);

export default router;

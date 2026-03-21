import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validation/auth.validation";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

export default router;

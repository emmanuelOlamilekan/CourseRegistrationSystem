import { Router } from "express";
import {
  addPrerequisite,
  getPrerequisites,
  getAllPrerequisites,
  removePrerequisite,
} from "../controllers/prerequisite.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addPrerequisiteSchema } from "../validation/prerequisite.validation";

const router = Router();

// Public reads
router.get("/:courseId", getPrerequisites);
router.get("/:courseId/all", getAllPrerequisites);

// Admin only mutations
router.use(authMiddleware(["admin"]));
router.post("/", validate(addPrerequisiteSchema), addPrerequisite);
router.delete("/", removePrerequisite);

export default router;

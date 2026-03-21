import { Router } from "express";
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "../controllers/program.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createProgramSchema,
  updateProgramSchema,
} from "../validation/program.validation";

const router = Router();

router.get("/", getPrograms);
router.get("/:id", getProgramById);

router.use(authMiddleware(["admin"]));
router.post("/", validate(createProgramSchema), createProgram);
router.patch("/:id", validate(updateProgramSchema), updateProgram);
router.delete("/:id", deleteProgram);

export default router;

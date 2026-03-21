import { Request, Response } from "express";
import { PrerequisiteService } from "../services/prerequisite.service";
import asyncHandler from "../utils/asyncHandler";

export const addPrerequisite = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, requiredCourseId } = req.body;
    const prereq = await PrerequisiteService.add(courseId, requiredCourseId);
    res.status(201).json({ success: true, data: prereq });
  }
);

export const getPrerequisites = asyncHandler(
  async (req: Request, res: Response) => {
    const prereqs = await PrerequisiteService.getForCourse(
      String(req.params.courseId)
    );
    res.json({ success: true, data: prereqs });
  }
);

export const getAllPrerequisites = asyncHandler(
  async (req: Request, res: Response) => {
    const prereqs = await PrerequisiteService.getAllPrerequisites(
      String(req.params.courseId)
    );
    res.json({ success: true, data: prereqs });
  }
);

export const removePrerequisite = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, requiredCourseId } = req.body;
    await PrerequisiteService.remove(courseId, requiredCourseId);
    res.status(204).send();
  }
);

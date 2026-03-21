import { Request, Response } from "express";
import { StudentCurriculumService } from "../services/studentCurriculum.service";
import { GraduationService } from "../services/graduation.service";
import asyncHandler from "../utils/asyncHandler";

export const assignCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, curriculumId } = req.body;
    const assignment = await StudentCurriculumService.assign(
      studentId,
      curriculumId
    );
    res.status(201).json({ success: true, data: assignment });
  }
);

export const migrateCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, newCurriculumId } = req.body;
    const assignment = await StudentCurriculumService.migrate(
      studentId,
      newCurriculumId
    );
    res.json({ success: true, data: assignment });
  }
);

export const getCurrentCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, programId } = req.params;
    const assignment = await StudentCurriculumService.getCurrent(
      String(studentId),
      String(programId)
    );
    res.json({ success: true, data: assignment });
  }
);

export const getCurriculumHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, programId } = req.params;
    const history = await StudentCurriculumService.getHistory(
      String(studentId),
      String(programId)
    );
    res.json({ success: true, data: history });
  }
);

export const checkGraduation = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, programId, completedCourseIds } = req.body;
    const result = await GraduationService.checkEligibility(
      studentId,
      programId,
      completedCourseIds
    );
    res.json({ success: true, data: result });
  }
);

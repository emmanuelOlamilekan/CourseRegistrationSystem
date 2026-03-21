import { Request, Response } from "express";
import { CourseMappingService } from "../services/courseMapping.service";
import asyncHandler from "../utils/asyncHandler";

export const addCourseMapping = asyncHandler(
  async (req: Request, res: Response) => {
    const mapping = await CourseMappingService.addCourse({
      curriculumId: String(req.params.curriculumId),
      ...req.body,
    });
    res.status(201).json({ success: true, data: mapping });
  }
);

export const getCourseMappings = asyncHandler(
  async (req: Request, res: Response) => {
    const { level, semester } = req.query;

    if (level && semester) {
      const mappings = await CourseMappingService.getSemesterCourses(
        String(req.params.curriculumId),
        Number(level),
        Number(semester)
      );
      return res.json({ success: true, data: mappings });
    }

    if (level) {
      const mappings = await CourseMappingService.findByLevel(
        String(req.params.curriculumId),
        Number(level)
      );
      return res.json({ success: true, data: mappings });
    }

    const mappings = await CourseMappingService.findByCurriculum(
      String(req.params.curriculumId)
    );
    res.json({ success: true, data: mappings });
  }
);

export const updateCourseMapping = asyncHandler(
  async (req: Request, res: Response) => {
    const mapping = await CourseMappingService.updateCourse(
      String(req.params.id),
      req.body
    );
    res.json({ success: true, data: mapping });
  }
);

export const removeCourseMapping = asyncHandler(
  async (req: Request, res: Response) => {
    await CourseMappingService.removeCourse(String(req.params.id));
    res.status(204).send();
  }
);

export const getCreditUnits = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.query as { type?: "Core" | "Elective" };
    const total = await CourseMappingService.getTotalCreditUnits(
      String(req.params.curriculumId),
      type
    );
    res.json({ success: true, data: { total } });
  }
);

import { Request, Response } from "express";
import { CurriculumService } from "../services/curriculum.service";
import asyncHandler from "../utils/asyncHandler";

export const createCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const curriculum = await CurriculumService.create(req.body);
    res.status(201).json({ success: true, data: curriculum });
  }
);

export const getCurriculaByProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const curricula = await CurriculumService.findByProgram(
      String(req.params.programId)
    );
    res.json({ success: true, data: curricula });
  }
);

export const getActiveCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const curriculum = await CurriculumService.getActive(
      String(req.params.programId)
    );
    res.json({ success: true, data: curriculum });
  }
);

export const getCurriculumById = asyncHandler(
  async (req: Request, res: Response) => {
    const curriculum = await CurriculumService.findById(
      String(req.params.id)
    );
    res.json({ success: true, data: curriculum });
  }
);

export const activateCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const curriculum = await CurriculumService.activate(
      String(req.params.id)
    );
    res.json({ success: true, data: curriculum });
  }
);

export const deactivateCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    const curriculum = await CurriculumService.deactivate(
      String(req.params.id)
    );
    res.json({ success: true, data: curriculum });
  }
);

export const deleteCurriculum = asyncHandler(
  async (req: Request, res: Response) => {
    await CurriculumService.delete(String(req.params.id));
    res.status(204).send();
  }
);

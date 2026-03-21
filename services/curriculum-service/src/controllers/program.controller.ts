import { Request, Response } from "express";
import { ProgramService } from "../services/program.service";
import asyncHandler from "../utils/asyncHandler";

export const createProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const program = await ProgramService.create(req.body);
    res.status(201).json({ success: true, data: program });
  }
);

export const getPrograms = asyncHandler(
  async (req: Request, res: Response) => {
    const { departmentId, isActive } = req.query;
    const query: { departmentId?: string; isActive?: boolean } = {};
    if (departmentId) query.departmentId = String(departmentId);
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await ProgramService.findAll(query);
    res.json({ success: true, ...result });
  }
);

export const getProgramById = asyncHandler(
  async (req: Request, res: Response) => {
    const program = await ProgramService.findById(String(req.params.id));
    res.json({ success: true, data: program });
  }
);

export const updateProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const program = await ProgramService.update(
      String(req.params.id),
      req.body
    );
    res.json({ success: true, data: program });
  }
);

export const deleteProgram = asyncHandler(
  async (req: Request, res: Response) => {
    await ProgramService.delete(String(req.params.id));
    res.status(204).send();
  }
);

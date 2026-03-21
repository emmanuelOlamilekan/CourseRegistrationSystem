import { Request, Response } from "express";
import { FacultyService } from "../services/faculty.service";

export class FacultyController {
  static async create(req: Request, res: Response) {
    const faculty = await FacultyService.create(req.body);
    res.status(201).json({ success: true, data: faculty });
  }

  static async findAll(_req: Request, res: Response) {
    const faculties = await FacultyService.findAll();
    res.json({ success: true, data: faculties });
  }

  static async findById(req: Request, res: Response) {
    const faculty = await FacultyService.findById(String(req.params.id));
    res.json({ success: true, data: faculty });
  }

  static async update(req: Request, res: Response) {
    const faculty = await FacultyService.update(String(req.params.id), req.body);
    res.json({ success: true, data: faculty });
  }

  static async delete(req: Request, res: Response) {
    await FacultyService.delete(String(req.params.id));
    res.status(204).send();
  }
}

import { Request, Response } from "express";
import { DepartmentService } from "../services/department.service";

export class DepartmentController {
  static async create(req: Request, res: Response) {
    const department = await DepartmentService.create(req.body);
    res.status(201).json({ success: true, data: department });
  }

  static async findAll(_req: Request, res: Response) {
    const departments = await DepartmentService.findAll();
    res.json({ success: true, data: departments });
  }

  static async findById(req: Request, res: Response) {
    const department = await DepartmentService.findById(String(req.params.id));
    res.json({ success: true, data: department });
  }

  static async findByFaculty(req: Request, res: Response) {
    const departments = await DepartmentService.findByFaculty(String(req.params.facultyId));
    res.json({ success: true, data: departments });
  }

  static async update(req: Request, res: Response) {
    const department = await DepartmentService.update(String(req.params.id), req.body);
    res.json({ success: true, data: department });
  }

  static async delete(req: Request, res: Response) {
    await DepartmentService.delete(String(req.params.id));
    res.status(204).send();
  }
}

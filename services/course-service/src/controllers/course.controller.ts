import { Request, Response } from "express";
import { CourseService } from "../services/course.service";

export class CourseController {
  static async create(req: Request, res: Response) {
    const course = await CourseService.create(req.body);
    res.status(201).json({ success: true, data: course });
  }

  static async findAll(req: Request, res: Response) {
    const { departmentId, lecturerId, search, page, limit } = req.query;
    const result = await CourseService.findAll({
      departmentId: departmentId ? String(departmentId) : undefined,
      lecturerId: lecturerId ? String(lecturerId) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ success: true, ...result });
  }

  static async findById(req: Request, res: Response) {
    const course = await CourseService.findById(String(req.params.id));
    res.json({ success: true, data: course });
  }

  static async findByCode(req: Request, res: Response) {
    const course = await CourseService.findByCode(String(req.params.code));
    res.json({ success: true, data: course });
  }

  static async findByDepartment(req: Request, res: Response) {
    const courses = await CourseService.findByDepartment(String(req.params.departmentId));
    res.json({ success: true, data: courses });
  }

  static async update(req: Request, res: Response) {
    const course = await CourseService.update(String(req.params.id), req.body);
    res.json({ success: true, data: course });
  }

  static async delete(req: Request, res: Response) {
    await CourseService.delete(String(req.params.id));
    res.status(204).send();
  }
}

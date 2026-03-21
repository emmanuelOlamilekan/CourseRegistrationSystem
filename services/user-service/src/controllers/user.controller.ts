import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  static async create(req: Request, res: Response) {
    const user = await UserService.create(req.body);
    res.status(201).json({ success: true, data: user });
  }

  static async findAll(req: Request, res: Response) {
    const { role, facultyId, departmentId, isActive, page, limit } = req.query;
    const result = await UserService.findAll({
      role: role ? String(role) : undefined,
      facultyId: facultyId ? String(facultyId) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ success: true, ...result });
  }

  static async findById(req: Request, res: Response) {
    const user = await UserService.findById(String(req.params.id));
    res.json({ success: true, data: user });
  }

  static async getMe(req: Request, res: Response) {
    const user = await UserService.findById(req.user!.userId);
    res.json({ success: true, data: user });
  }

  static async updateMe(req: Request, res: Response) {
    const user = await UserService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  }

  static async updateById(req: Request, res: Response) {
    const user = await UserService.updateById(String(req.params.id), req.body);
    res.json({ success: true, data: user });
  }

  static async findByFaculty(req: Request, res: Response) {
    const { role } = req.query;
    const users = await UserService.findByFaculty(
      String(req.params.facultyId),
      role ? String(role) : undefined
    );
    res.json({ success: true, data: users });
  }

  static async findByDepartment(req: Request, res: Response) {
    const { role } = req.query;
    const users = await UserService.findByDepartment(
      String(req.params.departmentId),
      role ? String(role) : undefined
    );
    res.json({ success: true, data: users });
  }

  static async deactivate(req: Request, res: Response) {
    const user = await UserService.deactivate(String(req.params.id));
    res.json({ success: true, data: user });
  }
}

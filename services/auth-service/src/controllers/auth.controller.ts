import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterInput, LoginInput } from "../validation/auth.validation";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, role } = req.body as RegisterInput;
    const user = await AuthService.register(email, password, role);
    res.status(201).json({ success: true, data: user });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;
    const tokens = await AuthService.login(email, password);
    res.json({ success: true, data: tokens });
  }
}

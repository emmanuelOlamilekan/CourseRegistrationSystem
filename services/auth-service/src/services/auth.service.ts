import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

export class AuthService {
  static async register(email: string, password: string, role: string) {
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    return { _id: user._id, email: user.email, role: user.role };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const payload = { userId: user._id.toString(), role: user.role };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

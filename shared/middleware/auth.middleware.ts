import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";

export const authMiddleware = (roles: string[] = []) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new UnauthorizedError("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
      };

      if (roles.length && !roles.includes(decoded.role)) {
        return next(new ForbiddenError("Access denied"));
      }

      req.user = decoded;
      next();
    } catch {
      return next(new UnauthorizedError("Invalid token"));
    }
  };
};

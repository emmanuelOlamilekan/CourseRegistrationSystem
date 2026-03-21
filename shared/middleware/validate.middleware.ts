import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../errors/BadRequestError";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const message = err.issues.map((e: { message: string }) => e.message).join(", ");
        return next(new BadRequestError(message));
      }
      next(err as Error);
    }
  };
};

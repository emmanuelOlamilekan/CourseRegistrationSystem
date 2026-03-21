import { Program, IProgram } from "../models/program.model";
import { NotFoundError, BadRequestError } from "../../../../shared/errors";

export interface CreateProgramInput {
  name: string;
  departmentId: string;
  duration: number;
}

export interface UpdateProgramInput {
  name?: string;
  duration?: number;
  isActive?: boolean;
}

export interface ProgramQuery {
  departmentId?: string;
  isActive?: boolean;
}

export class ProgramService {
  static async create(data: CreateProgramInput): Promise<IProgram> {
    const existing = await Program.findOne({
      departmentId: data.departmentId,
      name: data.name,
    });
    if (existing) {
      throw new BadRequestError(
        `A program named "${data.name}" already exists in this department`
      );
    }
    return Program.create(data);
  }

  static async findAll(
    query: ProgramQuery = {}
  ): Promise<{ programs: IProgram[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const [programs, total] = await Promise.all([
      Program.find(filter).sort({ name: 1 }),
      Program.countDocuments(filter),
    ]);
    return { programs, total };
  }

  static async findById(id: string): Promise<IProgram> {
    const program = await Program.findById(id);
    if (!program) throw new NotFoundError("Program not found");
    return program;
  }

  static async update(id: string, data: UpdateProgramInput): Promise<IProgram> {
    const program = await Program.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!program) throw new NotFoundError("Program not found");
    return program;
  }

  static async delete(id: string): Promise<void> {
    const { Curriculum } = await import("../models/curriculum.model");
    const linked = await Curriculum.exists({ programId: id });
    if (linked) {
      throw new BadRequestError(
        "Cannot delete a program that has associated curricula"
      );
    }
    const program = await Program.findByIdAndDelete(id);
    if (!program) throw new NotFoundError("Program not found");
  }
}

import { Faculty, IFaculty } from "../models/faculty.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

export class FacultyService {
  static async create(data: Pick<IFaculty, "name" | "code">): Promise<IFaculty> {
    const existing = await Faculty.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${data.name}$`, "i") } },
        { code: data.code.toUpperCase() },
      ],
    });
    if (existing) throw new BadRequestError("Faculty with this name or code already exists");

    return Faculty.create({ name: data.name, code: data.code.toUpperCase() });
  }

  static async findAll(): Promise<IFaculty[]> {
    return Faculty.find().sort({ name: 1 });
  }

  static async findById(id: string): Promise<IFaculty> {
    const faculty = await Faculty.findById(id);
    if (!faculty) throw new NotFoundError("Faculty not found");
    return faculty;
  }

  static async update(
    id: string,
    data: Partial<Pick<IFaculty, "name" | "code">>
  ): Promise<IFaculty> {
    if (data.code) data.code = data.code.toUpperCase();

    const faculty = await Faculty.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!faculty) throw new NotFoundError("Faculty not found");
    return faculty;
  }

  static async delete(id: string): Promise<void> {
    const faculty = await Faculty.findByIdAndDelete(id);
    if (!faculty) throw new NotFoundError("Faculty not found");
  }
}

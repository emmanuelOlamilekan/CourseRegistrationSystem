import { Department, IDepartment } from "../models/department.model";
import { Faculty } from "../models/faculty.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

export class DepartmentService {
  static async create(
    data: Pick<IDepartment, "name" | "code" | "facultyId">
  ): Promise<IDepartment> {
    const faculty = await Faculty.findById(data.facultyId);
    if (!faculty) throw new NotFoundError("Faculty not found");

    const existing = await Department.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new BadRequestError("Department with this code already exists");

    return Department.create({ ...data, code: data.code.toUpperCase() });
  }

  static async findAll(): Promise<IDepartment[]> {
    return Department.find().sort({ name: 1 });
  }

  static async findById(id: string): Promise<IDepartment> {
    const department = await Department.findById(id);
    if (!department) throw new NotFoundError("Department not found");
    return department;
  }

  static async findByFaculty(facultyId: string): Promise<IDepartment[]> {
    return Department.find({ facultyId }).sort({ name: 1 });
  }

  static async update(
    id: string,
    data: Partial<Pick<IDepartment, "name" | "code" | "facultyId">>
  ): Promise<IDepartment> {
    if (data.code) data.code = data.code.toUpperCase();

    if (data.facultyId) {
      const faculty = await Faculty.findById(data.facultyId);
      if (!faculty) throw new NotFoundError("Faculty not found");
    }

    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!department) throw new NotFoundError("Department not found");
    return department;
  }

  static async delete(id: string): Promise<void> {
    const department = await Department.findByIdAndDelete(id);
    if (!department) throw new NotFoundError("Department not found");
  }
}

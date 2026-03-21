import { Course, ICourse } from "../models/course.model";
import { Department } from "../models/department.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

interface CreateCourseInput {
  title: string;
  code: string;
  description?: string;
  lecturerId: string;
  departmentId: string;
  capacity?: number;
}

interface UpdateCourseInput {
  title?: string;
  description?: string;
  lecturerId?: string;
  departmentId?: string;
  capacity?: number;
}

interface CourseQuery {
  departmentId?: string;
  lecturerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class CourseService {
  static async create(data: CreateCourseInput): Promise<ICourse> {
    const department = await Department.findById(data.departmentId);
    if (!department) throw new NotFoundError("Department not found");

    const existing = await Course.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new BadRequestError("Course with this code already exists");

    return Course.create(data);
  }

  static async findAll(query: CourseQuery = {}): Promise<{ courses: ICourse[]; total: number }> {
    const { departmentId, lecturerId, search, page = 1, limit = 20 } = query;
    const filter: Record<string, unknown> = {};

    if (departmentId) filter.departmentId = departmentId;
    if (lecturerId) filter.lecturerId = lecturerId;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);

    return { courses, total };
  }

  static async findById(id: string): Promise<ICourse> {
    const course = await Course.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  static async findByCode(code: string): Promise<ICourse> {
    const course = await Course.findOne({ code: code.toUpperCase() });
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  static async findByDepartment(departmentId: string): Promise<ICourse[]> {
    return Course.find({ departmentId }).sort({ code: 1 });
  }

  static async update(id: string, data: UpdateCourseInput): Promise<ICourse> {
    if (data.departmentId) {
      const department = await Department.findById(data.departmentId);
      if (!department) throw new NotFoundError("Department not found");
    }

    const course = await Course.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  static async delete(id: string): Promise<void> {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new NotFoundError("Course not found");
  }
}

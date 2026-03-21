import { CourseMapping, ICourseMapping } from "../models/courseMapping.model";
import { NotFoundError, BadRequestError } from "../../../../shared/errors";

export interface AddCourseMappingInput {
  curriculumId: string;
  courseId: string;
  level: number;
  semester: number;
  type: "Core" | "Elective";
  creditUnit: number;
}

export interface UpdateCourseMappingInput {
  level?: number;
  semester?: number;
  type?: "Core" | "Elective";
  creditUnit?: number;
}

export class CourseMappingService {
  /**
   * Business Rule: A course cannot exist in multiple levels within the same curriculum.
   * Enforced via unique index on { curriculumId, courseId }.
   */
  static async addCourse(data: AddCourseMappingInput): Promise<ICourseMapping> {
    const existing = await CourseMapping.findOne({
      curriculumId: data.curriculumId,
      courseId: data.courseId,
    });
    if (existing) {
      throw new BadRequestError(
        "This course is already mapped to this curriculum at another level"
      );
    }
    return CourseMapping.create(data);
  }

  static async updateCourse(
    id: string,
    data: UpdateCourseMappingInput
  ): Promise<ICourseMapping> {
    const mapping = await CourseMapping.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!mapping) throw new NotFoundError("Course mapping not found");
    return mapping;
  }

  static async removeCourse(id: string): Promise<void> {
    const mapping = await CourseMapping.findByIdAndDelete(id);
    if (!mapping) throw new NotFoundError("Course mapping not found");
  }

  static async findByCurriculum(
    curriculumId: string
  ): Promise<ICourseMapping[]> {
    return CourseMapping.find({ curriculumId }).sort({ level: 1, semester: 1 });
  }

  static async findByLevel(
    curriculumId: string,
    level: number
  ): Promise<ICourseMapping[]> {
    return CourseMapping.find({ curriculumId, level }).sort({ semester: 1 });
  }

  static async getSemesterCourses(
    curriculumId: string,
    level: number,
    semester: number
  ): Promise<ICourseMapping[]> {
    return CourseMapping.find({ curriculumId, level, semester });
  }

  static async getTotalCreditUnits(
    curriculumId: string,
    type?: "Core" | "Elective"
  ): Promise<number> {
    const filter: Record<string, unknown> = { curriculumId };
    if (type) filter.type = type;

    const result = await CourseMapping.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$creditUnit" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async findById(id: string): Promise<ICourseMapping> {
    const mapping = await CourseMapping.findById(id);
    if (!mapping) throw new NotFoundError("Course mapping not found");
    return mapping;
  }
}

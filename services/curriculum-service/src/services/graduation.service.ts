import { CourseMapping } from "../models/courseMapping.model";
import { StudentCurriculum } from "../models/studentCurriculum.model";
import { Curriculum } from "../models/curriculum.model";
import { NotFoundError } from "../../../../shared/errors";

export interface GraduationEligibility {
  eligible: boolean;
  completedCoreCount: number;
  totalCoreCount: number;
  missingCoreCourses: string[];
  completedCreditUnits: number;
  requiredCreditUnits: number;
  creditUnitsSatisfied: boolean;
}

export class GraduationService {
  /**
   * Business Rule: Core courses are mandatory for graduation.
   * Checks if the student has completed all core courses in their active curriculum
   * and meets the minimum credit unit requirement.
   *
   * @param studentId - The student's ID
   * @param programId - The program ID
   * @param completedCourseIds - Array of courseIds the student has passed
   */
  static async checkEligibility(
    studentId: string,
    programId: string,
    completedCourseIds: string[]
  ): Promise<GraduationEligibility> {
    // Get the student's active curriculum
    const assignment = await StudentCurriculum.findOne({
      studentId,
      programId,
      isActive: true,
    });
    if (!assignment) {
      throw new NotFoundError(
        "No active curriculum found for this student in this program"
      );
    }

    const curriculumId = String(assignment.curriculumId);

    // Get all core courses for the curriculum
    const coreCourses = await GraduationService.getCoreCourses(curriculumId);
    const completedSet = new Set(completedCourseIds);

    const missingCoreCourses = coreCourses.filter(
      (courseId) => !completedSet.has(courseId)
    );
    const completedCoreCount = coreCourses.length - missingCoreCourses.length;

    // Compute credit units for completed courses
    const completedMappings = await CourseMapping.find({
      curriculumId,
      courseId: { $in: completedCourseIds },
    });
    const completedCreditUnits = completedMappings.reduce(
      (sum, m) => sum + m.creditUnit,
      0
    );

    const requiredCreditUnits =
      await GraduationService.getTotalCreditRequirement(curriculumId);

    const creditUnitsSatisfied = completedCreditUnits >= requiredCreditUnits;
    const eligible =
      missingCoreCourses.length === 0 && creditUnitsSatisfied;

    return {
      eligible,
      completedCoreCount,
      totalCoreCount: coreCourses.length,
      missingCoreCourses,
      completedCreditUnits,
      requiredCreditUnits,
      creditUnitsSatisfied,
    };
  }

  /**
   * Returns all courseIds mapped as "Core" in the given curriculum.
   */
  static async getCoreCourses(curriculumId: string): Promise<string[]> {
    const mappings = await CourseMapping.find({
      curriculumId,
      type: "Core",
    }).select("courseId");
    return mappings.map((m) => m.courseId);
  }

  /**
   * Returns the total credit units required to graduate (sum of all courses in curriculum).
   * Programs define graduation requirements via the full curriculum credit load.
   */
  static async getTotalCreditRequirement(curriculumId: string): Promise<number> {
    // Verify curriculum exists
    const curriculum = await Curriculum.findById(curriculumId);
    if (!curriculum) throw new NotFoundError("Curriculum not found");

    const result = await CourseMapping.aggregate([
      { $match: { curriculumId } },
      { $group: { _id: null, total: { $sum: "$creditUnit" } } },
    ]);
    return result[0]?.total ?? 0;
  }
}

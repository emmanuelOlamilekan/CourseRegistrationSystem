import { Prerequisite, IPrerequisite } from "../models/prerequisite.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

export class PrerequisiteService {
  /**
   * Business Rule: Prerequisite cycles are not allowed.
   * Uses DFS to detect if adding requiredCourseId → courseId would create a cycle.
   */
  static async add(
    courseId: string,
    requiredCourseId: string
  ): Promise<IPrerequisite> {
    if (courseId === requiredCourseId) {
      throw new BadRequestError("A course cannot be its own prerequisite");
    }

    // Check if this pair already exists
    const existing = await Prerequisite.findOne({ courseId, requiredCourseId });
    if (existing) {
      throw new BadRequestError("This prerequisite relationship already exists");
    }

    // DFS cycle detection: would adding requiredCourseId → courseId form a cycle?
    // i.e. can we reach requiredCourseId starting from courseId through existing prerequisites?
    const hasCycle = await PrerequisiteService.detectCycle(
      requiredCourseId,
      courseId,
      new Set<string>()
    );
    if (hasCycle) {
      throw new BadRequestError(
        "Adding this prerequisite would create a circular dependency"
      );
    }

    return Prerequisite.create({ courseId, requiredCourseId });
  }

  /**
   * DFS: Can we reach `target` starting from `current` by following prerequisite chains?
   * If yes, adding `target` as a prerequisite of `start` (the original courseId) would create a cycle.
   */
  private static async detectCycle(
    current: string,
    target: string,
    visited: Set<string>
  ): Promise<boolean> {
    if (current === target) return true;
    if (visited.has(current)) return false;

    visited.add(current);

    // Get all courses that `current` requires
    const prerequisites = await Prerequisite.find({ courseId: current }).select(
      "requiredCourseId"
    );

    for (const prereq of prerequisites) {
      if (
        await PrerequisiteService.detectCycle(
          prereq.requiredCourseId,
          target,
          visited
        )
      ) {
        return true;
      }
    }

    return false;
  }

  static async remove(courseId: string, requiredCourseId: string): Promise<void> {
    const prereq = await Prerequisite.findOneAndDelete({
      courseId,
      requiredCourseId,
    });
    if (!prereq) throw new NotFoundError("Prerequisite relationship not found");
  }

  static async getForCourse(courseId: string): Promise<IPrerequisite[]> {
    return Prerequisite.find({ courseId });
  }

  static async getAllPrerequisites(courseId: string): Promise<string[]> {
    // BFS traversal to get the full transitive prerequisite list
    const result: string[] = [];
    const queue: string[] = [courseId];
    const seen = new Set<string>([courseId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const prerequisites = await Prerequisite.find({ courseId: current }).select(
        "requiredCourseId"
      );

      for (const prereq of prerequisites) {
        if (!seen.has(prereq.requiredCourseId)) {
          seen.add(prereq.requiredCourseId);
          result.push(prereq.requiredCourseId);
          queue.push(prereq.requiredCourseId);
        }
      }
    }

    return result;
  }
}

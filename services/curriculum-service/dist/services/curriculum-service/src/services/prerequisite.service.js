"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrerequisiteService = void 0;
const prerequisite_model_1 = require("../models/prerequisite.model");
const errors_1 = require("../../../../shared/errors");
class PrerequisiteService {
    /**
     * Business Rule: Prerequisite cycles are not allowed.
     * Uses DFS to detect if adding requiredCourseId → courseId would create a cycle.
     */
    static async add(courseId, requiredCourseId) {
        if (courseId === requiredCourseId) {
            throw new errors_1.BadRequestError("A course cannot be its own prerequisite");
        }
        // Check if this pair already exists
        const existing = await prerequisite_model_1.Prerequisite.findOne({ courseId, requiredCourseId });
        if (existing) {
            throw new errors_1.BadRequestError("This prerequisite relationship already exists");
        }
        // DFS cycle detection: would adding requiredCourseId → courseId form a cycle?
        // i.e. can we reach requiredCourseId starting from courseId through existing prerequisites?
        const hasCycle = await PrerequisiteService.detectCycle(requiredCourseId, courseId, new Set());
        if (hasCycle) {
            throw new errors_1.BadRequestError("Adding this prerequisite would create a circular dependency");
        }
        return prerequisite_model_1.Prerequisite.create({ courseId, requiredCourseId });
    }
    /**
     * DFS: Can we reach `target` starting from `current` by following prerequisite chains?
     * If yes, adding `target` as a prerequisite of `start` (the original courseId) would create a cycle.
     */
    static async detectCycle(current, target, visited) {
        if (current === target)
            return true;
        if (visited.has(current))
            return false;
        visited.add(current);
        // Get all courses that `current` requires
        const prerequisites = await prerequisite_model_1.Prerequisite.find({ courseId: current }).select("requiredCourseId");
        for (const prereq of prerequisites) {
            if (await PrerequisiteService.detectCycle(prereq.requiredCourseId, target, visited)) {
                return true;
            }
        }
        return false;
    }
    static async remove(courseId, requiredCourseId) {
        const prereq = await prerequisite_model_1.Prerequisite.findOneAndDelete({
            courseId,
            requiredCourseId,
        });
        if (!prereq)
            throw new errors_1.NotFoundError("Prerequisite relationship not found");
    }
    static async getForCourse(courseId) {
        return prerequisite_model_1.Prerequisite.find({ courseId });
    }
    static async getAllPrerequisites(courseId) {
        // BFS traversal to get the full transitive prerequisite list
        const result = [];
        const queue = [courseId];
        const seen = new Set([courseId]);
        while (queue.length > 0) {
            const current = queue.shift();
            const prerequisites = await prerequisite_model_1.Prerequisite.find({ courseId: current }).select("requiredCourseId");
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
exports.PrerequisiteService = PrerequisiteService;

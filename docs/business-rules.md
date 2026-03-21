# Business Rules

This document records every domain constraint enforced by the system, where in the code it is enforced, and what happens when it is violated.

---

## Curriculum Rules

### BR-C1 — A course cannot exist in multiple levels within the same curriculum

**Where enforced:**
- MongoDB unique index on `{ curriculumId, courseId }` in `CourseMapping` collection (database-level)
- Explicit pre-insert check in `CourseMappingService.addCourse()` with a clear error message (application-level)

**Violation response:** `400 Bad Request` — "This course is already mapped to this curriculum at another level"

**Rationale:** A course belongs to exactly one level and semester within a curriculum. Allowing duplicates would create ambiguity in prerequisite checking and credit unit counting.

---

### BR-C2 — A student must follow only one active curriculum version per program

**Where enforced:**
- MongoDB partial filter expression unique index on `{ studentId, programId }` where `isActive: true` in `StudentCurriculum` collection (database-level):
  ```
  { unique: true, partialFilterExpression: { isActive: true } }
  ```
- `StudentCurriculumService.assign()` checks for an existing active assignment before creating (application-level)
- `StudentCurriculumService.migrate()` deactivates the old record atomically in a MongoDB session before creating the new one

**Violation response:** `400 Bad Request` — "Student already has an active curriculum for this program. Use migrate to switch."

**Rationale:** A student's course requirements, prerequisites, and graduation criteria all depend on a single curriculum version. Multiple active versions would make these checks ambiguous.

---

### BR-C3 — Prerequisite cycles are not allowed

**Where enforced:**
- `PrerequisiteService.add()` runs a DFS traversal before every insert to detect whether the new edge would form a cycle (application-level):
  - Self-reference is checked first: `courseId === requiredCourseId`
  - Then DFS from `requiredCourseId` checks whether `courseId` is reachable through existing prerequisite chains
- Unique index on `{ courseId, requiredCourseId }` prevents duplicate edges (database-level)

**Violation response:** `400 Bad Request` — "Adding this prerequisite would create a circular dependency"

**Rationale:** A cycle (e.g. A requires B, B requires C, C requires A) makes it impossible to ever satisfy prerequisites. It is a data integrity error.

---

### BR-C4 — Only one active curriculum per program

**Where enforced:**
- `CurriculumService.activate()` uses a MongoDB session transaction to atomically set `isActive: false` on all other curricula for the program before setting the target to `isActive: true`
- Partial index on `{ programId: 1, isActive: 1 }` enables fast lookups

**Violation response:** N/A — the service handles this automatically without error.

**Rationale:** When a new curriculum version is activated, all students not yet migrated still follow the old one (via their `StudentCurriculum` record). The program-level active flag indicates the default version for new student assignments.

---

### BR-C5 — A program name must be unique within a department

**Where enforced:**
- MongoDB unique index on `{ departmentId, name }` in `Program` collection
- Pre-insert check in `ProgramService.create()`

**Violation response:** `400 Bad Request` — "A program named '...' already exists in this department"

---

## Registration Rules

### BR-R1 — A student can only register courses in their active curriculum

**Where enforced:**
- `RegistrationService.enroll()` calls `CurriculumClient.getStudentCurriculum()` to fetch the active `curriculumId`, then calls `CurriculumClient.getCourseMapping()` to verify the course exists in that curriculum
- If either call fails (404 from curriculum-service), enrollment is rejected

**Violation response:** `400 Bad Request` / `404 Not Found` — "Course is not part of the student's active curriculum. Enrollment denied."

**Rationale:** Students can only register courses assigned to their curriculum version. This prevents registering courses from future or past curriculum versions.

---

### BR-R2 — All prerequisites must be completed before enrollment

**Where enforced:**
- `RegistrationService.enroll()` calls `CurriculumClient.getCoursePrerequisites()` to get required course IDs, then queries the `Registration` collection for records with `status: "completed"` for those courses
- Missing completions are listed by courseId in the error message

**Violation response:** `400 Bad Request` — "Prerequisites not completed. Missing course(s): \<ids\>"

**Rationale:** A completed registration (`status: "completed"`) is the system's source of truth for prerequisite satisfaction. A course is only complete after an admin or course advisor explicitly marks it via `PATCH /registrations/:id/complete`.

---

### BR-R3 — Core courses cannot be dropped

**Where enforced:**
- `RegistrationService.drop()` calls `CurriculumClient.getCourseMapping()` and checks `mapping.type === "Core"` before allowing the drop

**Violation response:** `400 Bad Request` — "Core courses are mandatory and cannot be dropped"

**Rationale:** Core courses are required for graduation. Allowing a student to drop them would silently prevent graduation eligibility.

---

### BR-R4 — A student cannot re-enroll in a completed course

**Where enforced:**
- `RegistrationService.enroll()` checks `existing.status === "completed"` before re-enrolling

**Violation response:** `400 Bad Request` — "Course already completed"

---

## User Rules

### BR-U1 — Students must have a matric number; staff must have a staff ID

**Where enforced:**
- Zod `superRefine` in `createUserSchema` and `adminUpdateSchema` in `user.validation.ts`

**Violation response:** `400 Bad Request` with field-level error on `matricNumber` or `staffId`

---

### BR-U2 — Only lecturers can be level advisors

**Where enforced:**
- Zod `superRefine` checks `role === "lecturer"` when `isLevelAdvisor: true`

**Violation response:** `400 Bad Request` — "Only lecturers can be assigned as level advisors"

---

### BR-U3 — Students cannot have a staff ID; non-students cannot have a matric number

**Where enforced:**
- Zod `superRefine` cross-field validation in `createUserSchema`

**Violation response:** `400 Bad Request` with field-level errors on the conflicting field

---

## Graduation Rules

### BR-G1 — All core courses must be completed for graduation eligibility

**Where enforced:**
- `GraduationService.checkEligibility()` fetches all `type: "Core"` course mappings for the student's active curriculum and checks each against the provided `completedCourseIds`
- Returns `eligible: false` with a `missingCoreCourses` list if any are incomplete

**Where called:** `POST /student-curricula/graduation-check`

---

### BR-G2 — Total credit units for completed courses must meet the curriculum requirement

**Where enforced:**
- `GraduationService.checkEligibility()` aggregates credit units for completed courses and compares against the total credit unit sum of the full curriculum
- Returns `creditUnitsSatisfied: false` if the threshold is not met

**Note:** The current implementation treats the full curriculum credit total as the graduation threshold. A configurable minimum credit requirement per program is a natural future enhancement.

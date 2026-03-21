# Curriculum Service API

Base path (via gateway): `/programs`, `/curricula`, `/prerequisites`, `/student-curricula`
Direct port: `3005`

All endpoints require a valid JWT. Read endpoints accept any role; mutating endpoints are `admin` only unless noted.

---

## Programs

A program belongs to a department and has a fixed duration (in years). It is the top-level entity that curricula are attached to.

### GET /programs

**Auth**: Any

**Query params**: `departmentId`, `isActive` (boolean)

**Response `200`**
```json
{
  "success": true,
  "programs": [ { "_id": "...", "name": "Computer Science", "departmentId": "...", "duration": 4, "isActive": true } ],
  "total": 5
}
```

### GET /programs/:id

**Auth**: Any — `404` if not found.

### POST /programs

**Auth**: `admin`

**Request body**
```json
{ "name": "Computer Science", "departmentId": "64f1...", "duration": 4 }
```

| Field | Constraints |
|---|---|
| `name` | 2–100 chars; unique within the department |
| `departmentId` | Required |
| `duration` | Integer 1–6 |

**Response `201`**. **Error `400`** if name already exists in department.

### PATCH /programs/:id

**Auth**: `admin` — `name`, `duration`, `isActive` (all optional).

### DELETE /programs/:id

**Auth**: `admin` — **Error `400`** if any curricula exist for this program.

---

## Curricula

A curriculum is a versioned collection of course mappings for a program. Only one curriculum per program can be `isActive: true` at a time.

### GET /curricula/program/:programId

List all curriculum versions for a program, sorted by version descending.

**Auth**: Any

### GET /curricula/program/:programId/active

Get the single active curriculum for a program.

**Auth**: Any — `404` if none is active.

### GET /curricula/:id

**Auth**: Any

### POST /curricula

**Auth**: `admin`

**Request body**
```json
{ "programId": "64f1...", "version": 2 }
```

New curricula are created as inactive (`isActive: false`). Use `PATCH /curricula/:id/activate` to activate.

**Error `400`** if version already exists for this program.

### PATCH /curricula/:id/activate

Atomically activates this curriculum and deactivates all other curricula for the same program. Uses a MongoDB session transaction.

**Auth**: `admin`

**Response `200`**: Updated curriculum object with `isActive: true`.

### PATCH /curricula/:id/deactivate

**Auth**: `admin`

### DELETE /curricula/:id

**Auth**: `admin` — **Error `400`** if any course mappings exist.

---

## Course Mappings

A course mapping places a course in a specific level and semester within a curriculum, and designates it as `Core` or `Elective`.

**Business rule**: A course can only appear once in a curriculum (across all levels). See [business-rules.md](../business-rules.md#br-c1).

### GET /curricula/:curriculumId/courses

List all course mappings. Optional query params: `level` (integer), `semester` (integer 1–2).

- `?level=2` → all courses at level 200
- `?level=2&semester=1` → only first-semester level 200 courses

**Auth**: Any

**Response `200`**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "curriculumId": "...", "courseId": "...", "level": 2, "semester": 1, "type": "Core", "creditUnit": 3 }
  ]
}
```

### GET /curricula/:curriculumId/courses/credits

Get total credit units. Optional `?type=Core` or `?type=Elective`.

**Auth**: Any

**Response `200`**: `{ "success": true, "data": { "total": 120 } }`

### POST /curricula/:curriculumId/courses

**Auth**: `admin`

**Request body**
```json
{ "courseId": "64f1...", "level": 2, "semester": 1, "type": "Core", "creditUnit": 3 }
```

| Field | Constraints |
|---|---|
| `level` | Integer 1–8 |
| `semester` | Integer 1–2 |
| `type` | `"Core"` or `"Elective"` |
| `creditUnit` | Integer 1–6 |

**Error `400`** if course already mapped in this curriculum.

### PATCH /curricula/:curriculumId/courses/:id

**Auth**: `admin` — `level`, `semester`, `type`, `creditUnit` (all optional).

### DELETE /curricula/:curriculumId/courses/:id

**Auth**: `admin` — **Response `204`**

---

## Prerequisites

A prerequisite is a directed edge: `courseId` requires `requiredCourseId` to be completed first. The service runs DFS cycle detection before every insert.

### GET /prerequisites/:courseId

Get direct prerequisites (one level deep).

**Auth**: Any

**Response `200`**
```json
{
  "success": true,
  "data": [ { "_id": "...", "courseId": "CSC201", "requiredCourseId": "CSC101" } ]
}
```

### GET /prerequisites/:courseId/all

Get the full transitive prerequisite chain (BFS traversal).

**Auth**: Any

**Response `200`**: `{ "success": true, "data": ["CSC101", "MAT101", ...] }` — array of courseIds.

### POST /prerequisites

**Auth**: `admin`

**Request body**
```json
{ "courseId": "64f1...", "requiredCourseId": "64f2..." }
```

**Errors**

| Status | Message |
|---|---|
| 400 | "A course cannot be its own prerequisite" |
| 400 | "This prerequisite relationship already exists" |
| 400 | "Adding this prerequisite would create a circular dependency" |

### DELETE /prerequisites

**Auth**: `admin`

**Request body**: `{ "courseId": "...", "requiredCourseId": "..." }`

**Response `204`**

---

## Student Curricula

Tracks which curriculum version each student is assigned to for each program.

### POST /student-curricula/assign

Assign a student to the given curriculum.

**Auth**: `admin`, `course_advisor`

**Request body**
```json
{ "studentId": "64f1...", "curriculumId": "64f2..." }
```

**Error `400`** if student already has an active curriculum for that program (use `/migrate` instead).

### POST /student-curricula/migrate

Move a student from their current curriculum to a new one. Atomically deactivates the old record and creates a new one with an audit trail (`migratedFrom` field).

**Auth**: `admin`, `course_advisor`

**Request body**
```json
{ "studentId": "64f1...", "newCurriculumId": "64f3..." }
```

**Errors**

| Status | Message |
|---|---|
| 404 | "No active curriculum found for this student in this program" |
| 400 | "Student is already on this curriculum" |

### POST /student-curricula/graduation-check

Check whether a student is eligible to graduate.

**Auth**: `student`, `course_advisor`, `admin`

**Request body**
```json
{
  "studentId": "64f1...",
  "programId": "64f2...",
  "completedCourseIds": ["64a1...", "64a2...", "64a3..."]
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "eligible": false,
    "completedCoreCount": 8,
    "totalCoreCount": 10,
    "missingCoreCourses": ["64a9...", "64aa..."],
    "completedCreditUnits": 96,
    "requiredCreditUnits": 120,
    "creditUnitsSatisfied": false
  }
}
```

`eligible: true` only when `missingCoreCourses` is empty **and** `creditUnitsSatisfied` is `true`.

### GET /student-curricula/:studentId/:programId

Get a student's current active curriculum assignment.

**Auth**: `student` (own only), `course_advisor`, `admin`

### GET /student-curricula/:studentId/:programId/history

Get all curriculum assignments (including past/migrated) for a student in a program, sorted by `assignedAt` descending.

**Auth**: `student` (own only), `course_advisor`, `admin`

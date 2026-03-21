# Registration Service API

Base path (via gateway): `/registrations`
Direct port: `3004`

All endpoints require a valid JWT.

---

## Key Concepts

- A registration record ties a **student** to a **course** within a specific **curriculum version** for a **program**.
- The `programId` on enroll is required because it drives the curriculum lookup.
- `status` values: `enrolled` → `completed` or `dropped`.
- **`completed` is the prerequisite gate**: a course is only counted as a prerequisite if its registration has `status: "completed"`.
- **Core courses cannot be dropped** (see [business-rules.md](../business-rules.md#br-r3)).

---

## POST /registrations/enroll

Enroll a student in a course.

**Auth**: `student`

The student is identified from the JWT (`req.user.userId`). They cannot enroll on behalf of another student.

**Request body**
```json
{
  "courseId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "programId": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

| Field | Required | Notes |
|---|---|---|
| `courseId` | Yes | The course to enroll in |
| `programId` | Yes | Used to look up the student's active curriculum |

**What happens internally:**
1. Fetches the student's active `StudentCurriculum` for `programId` from curriculum-service
2. Verifies the course is mapped in that curriculum → gets `level`, `semester` from the mapping
3. Fetches prerequisites for the course from curriculum-service
4. Checks that all prerequisites have a `status: "completed"` registration
5. Creates the registration record

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "studentId": "...",
    "courseId": "...",
    "programId": "...",
    "curriculumId": "...",
    "level": 2,
    "semester": 1,
    "status": "enrolled",
    "enrolledAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| 400 | "Already enrolled in this course" |
| 400 | "Course already completed" |
| 400 | "Prerequisites not completed. Missing course(s): \<ids\>" |
| 400 | "Course is not part of the student's active curriculum. Enrollment denied." |
| 404 | "No active curriculum found..." (from curriculum-service) |
| 503 | "Service temporarily unavailable" (curriculum-service is down) |

---

## POST /registrations/drop

Drop an enrolled course.

**Auth**: `student`

**Request body**
```json
{ "courseId": "64f1a2b3c4d5e6f7a8b9c0d1" }
```

The student can only drop their own enrollments. Core courses (`type: "Core"` in the curriculum mapping) cannot be dropped.

**Response `200`**: Updated registration with `status: "dropped"` and `droppedAt` timestamp.

**Errors**

| Status | Message |
|---|---|
| 400 | "Core courses are mandatory and cannot be dropped" |
| 404 | "Active enrollment not found" |

---

## GET /registrations/my

Get the authenticated student's enrolled courses.

**Auth**: `student`

**Query params**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status (`enrolled`, `completed`, `dropped`). Defaults to `enrolled`. |

**Response `200`**: Array of registration objects sorted by `enrolledAt` descending.

---

## GET /registrations/my/:programId/level/:level/semester/:semester

Get the authenticated student's registrations for a specific semester.

**Auth**: `student`

Returns all `enrolled` and `completed` registrations for the given program, level, and semester.

**Example**: `GET /registrations/my/64abc.../level/2/semester/1`

**Response `200`**: Array of registration objects.

---

## GET /registrations/course/:courseId

List all enrolled students for a course.

**Auth**: `lecturer`, `course_advisor`, `admin`

**Response `200`**: Array of registration objects with `status: "enrolled"`, sorted by `enrolledAt` ascending.

---

## GET /registrations/course/:courseId/count

Get the current enrollment count for a course.

**Auth**: `lecturer`, `course_advisor`, `admin`

**Response `200`**
```json
{
  "success": true,
  "data": { "count": 47 }
}
```

---

## PATCH /registrations/:id/complete

Mark a registration as completed (e.g. after exam results are recorded).

**Auth**: `course_advisor`, `admin`

This is the only way to satisfy prerequisite requirements for future course enrollments.

**Response `200`**: Updated registration with `status: "completed"` and `completedAt` timestamp.

**Errors**

| Status | Message |
|---|---|
| 400 | "Only enrolled registrations can be marked as completed" |
| 404 | "Registration not found" |

---

## GET /registrations/:id

Get a registration by ID.

**Auth**: `course_advisor`, `admin`

**Response `200`**: Registration object or `404`.

# User Service API

Base path (via gateway): `/users`
Direct port: `3002`

All endpoints require a valid JWT (`Authorization: Bearer <token>`).

---

## GET /users/me

Get the authenticated user's own profile.

**Auth**: Any role

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "student@uni.edu",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "role": "student",
    "matricNumber": "2021/CSC/001",
    "departmentId": "...",
    "facultyId": "...",
    "isActive": true
  }
}
```

---

## PATCH /users/me

Update own profile fields.

**Auth**: Any role

**Request body** (all fields optional)
```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "facultyId": "...",
  "departmentId": "...",
  "matricNumber": "2021/CSC/001",
  "staffId": "STAFF-001",
  "isLevelAdvisor": true,
  "levelAdvising": [100, 200]
}
```

> `isLevelAdvisor: true` requires `staffId` to be present. Validated by Zod.

**Response `200`**: Updated user object.

---

## GET /users/faculty/:facultyId

List all users in a faculty.

**Auth**: Any role

**Response `200`**: Array of user objects.

---

## GET /users/department/:departmentId

List all users in a department.

**Auth**: Any role

**Response `200`**: Array of user objects.

---

## GET /users

List all users (paginated).

**Auth**: `admin` only

**Response `200`**
```json
{
  "success": true,
  "data": [ ...users ],
  "total": 42
}
```

---

## POST /users

Create a user profile. Used by admins to create `course_advisor` accounts or pre-populate profiles.

**Auth**: `admin` only

**Request body**
```json
{
  "email": "advisor@uni.edu",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "course_advisor",
  "staffId": "STAFF-042",
  "departmentId": "...",
  "facultyId": "..."
}
```

**Cross-field validation rules** (enforced by Zod):

| Rule | Error |
|---|---|
| `role: "student"` requires `matricNumber` | "Matric number is required for students" |
| `role` in `[lecturer, course_advisor, admin]` requires `staffId` | "Staff ID is required for lecturers, course advisors and admins" |
| `isLevelAdvisor: true` requires `role: "lecturer"` | "Only lecturers can be assigned as level advisors" |
| `isLevelAdvisor: true` requires `staffId` | "Staff ID is required to be assigned as a level advisor" |
| `role: "student"` cannot have `staffId` | "Students cannot have a staff ID" |
| `role !== "student"` cannot have `matricNumber` | "Matric number is only applicable to students" |

**Response `201`**: Created user object.

---

## GET /users/:id

Get any user by ID.

**Auth**: `admin` only

**Response `200`**: User object or `404 Not Found`.

---

## PATCH /users/:id

Update any user's profile (admin version — can also set `isActive`).

**Auth**: `admin` only

**Request body**: Same fields as `PATCH /users/me` plus `isActive: boolean`.

**Response `200`**: Updated user object.

---

## DELETE /users/:id

Deactivate a user (sets `isActive: false`; does not delete the record).

**Auth**: `admin` only

**Response `204`**: No content.

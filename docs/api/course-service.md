# Course Service API

Base path (via gateway): `/courses`, `/faculties`, `/departments`
Direct port: `3003`

Read endpoints are **public** (no token required). Mutating endpoints require a JWT.

---

## Faculties

### GET /faculties

List all faculties.

**Auth**: Public

**Response `200`**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Faculty of Science", "isActive": true }
  ],
  "total": 3
}
```

### GET /faculties/:id

Get a faculty by ID.

**Auth**: Public

**Response `200`**: Faculty object or `404`.

### POST /faculties

**Auth**: `admin`

**Request body**
```json
{ "name": "Faculty of Engineering" }
```

**Response `201`**: Created faculty object.

### PATCH /faculties/:id

**Auth**: `admin`

**Request body**: `{ "name": "...", "isActive": false }` (all fields optional)

**Response `200`**: Updated faculty object.

### DELETE /faculties/:id

**Auth**: `admin`

**Response `204`**: No content.

---

## Departments

### GET /departments

List all departments.

**Auth**: Public

**Response `200`**: Array of department objects with `total`.

### GET /departments/:id

**Auth**: Public

### GET /departments/faculty/:facultyId

List all departments in a faculty.

**Auth**: Public

### POST /departments

**Auth**: `admin`

**Request body**
```json
{
  "name": "Computer Science",
  "facultyId": "64f1a2b3..."
}
```

**Response `201`**: Created department object.

### PATCH /departments/:id

**Auth**: `admin`

**Request body**: `{ "name": "...", "isActive": false }` (optional fields)

### DELETE /departments/:id

**Auth**: `admin`

**Response `204`**

---

## Courses

### GET /courses

List all courses with optional filters.

**Auth**: Public

**Query params**

| Param | Type | Description |
|---|---|---|
| `departmentId` | string | Filter by department |
| `isActive` | boolean | Filter by active status |
| `search` | string | Text search on title/code |

**Response `200`**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "...",
      "title": "Introduction to Programming",
      "code": "CSC101",
      "description": "Fundamentals of programming",
      "lecturerId": "...",
      "departmentId": "...",
      "capacity": 100,
      "isActive": true
    }
  ],
  "total": 24
}
```

### GET /courses/:id

**Auth**: Public

**Response `200`**: Course object or `404`.

### GET /courses/code/:code

Get a course by its unique course code (e.g. `CSC101`). Code is case-insensitive — stored and compared as uppercase.

**Auth**: Public

**Response `200`**: Course object or `404`.

### GET /courses/department/:departmentId

List all courses in a department.

**Auth**: Public

### POST /courses

**Auth**: `lecturer` or `admin`

**Request body**
```json
{
  "title": "Data Structures",
  "code": "CSC201",
  "description": "Arrays, linked lists, trees and graphs",
  "lecturerId": "64f1a2b3...",
  "departmentId": "64f1a2b3...",
  "capacity": 80
}
```

| Field | Required | Constraints |
|---|---|---|
| `title` | Yes | Non-empty string |
| `code` | Yes | Unique, stored uppercase |
| `lecturerId` | Yes | Must be a valid user ID |
| `departmentId` | Yes | Must be a valid department ID |
| `description` | No | |
| `capacity` | No | Min 1, default 100 |

**Response `201`**: Created course object.

### PATCH /courses/:id

**Auth**: `lecturer` or `admin`

**Request body**: Any subset of course fields (all optional).

**Response `200`**: Updated course object.

### DELETE /courses/:id

**Auth**: `admin` only

**Response `204`**

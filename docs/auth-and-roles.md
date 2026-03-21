# Authentication & Authorization

## JWT Flow

```
1. Client → POST /auth/register  →  auth-service creates user, returns { _id, email, role }
2. Client → POST /auth/login     →  auth-service returns { accessToken, refreshToken }
3. Client → Any protected route  →  Authorization: Bearer <accessToken>
4. Gateway verifies token, injects x-user-id + x-user-role headers, proxies request
5. Service re-verifies token via shared authMiddleware, reads req.user
```

### Token Details

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days |
| Payload | `{ userId: string, role: string }` |
| Secret | `JWT_SECRET` env var — must be identical on all services and the gateway |

### Header Forwarding (Gateway → Service)

After verifying the JWT, the gateway injects two headers before proxying:

| Header | Value |
|---|---|
| `x-user-id` | The `userId` from the decoded token |
| `x-user-role` | The `role` from the decoded token |

Services can read these for convenience, but they also independently re-verify the `Authorization` header. The headers must never be trusted from external clients — the gateway strips and re-sets them.

---

## Roles

| Role | Description |
|---|---|
| `student` | Enrolled student. Can register/drop elective courses. Requires `matricNumber`. |
| `lecturer` | Academic staff. Can create/update courses. Requires `staffId`. |
| `course_advisor` | Administrative academic staff. Can mark courses complete, view enrollments. Requires `staffId`. |
| `admin` | System administrator. Full access to all management endpoints. Requires `staffId`. |

### User Field Constraints by Role

| Field | student | lecturer | course_advisor | admin |
|---|---|---|---|---|
| `matricNumber` | Required | Not allowed | Not allowed | Not allowed |
| `staffId` | Not allowed | Required | Required | Required |
| `isLevelAdvisor` | Not allowed | Allowed | Not allowed | Not allowed |
| `levelAdvising` | Not allowed | Allowed (if `isLevelAdvisor`) | — | — |

> These constraints are enforced by Zod `superRefine` in `user.validation.ts`, not just at the database level.

---

## Route Permission Matrix

A `✓` means the role is accepted. A `—` means the request will be rejected with `403 Forbidden`.

### Auth Service (`/auth`)
| Endpoint | student | lecturer | course_advisor | admin | Public |
|---|---|---|---|---|---|
| `POST /auth/register` | — | — | — | — | ✓ |
| `POST /auth/login` | — | — | — | — | ✓ |

### User Service (`/users`)
| Endpoint | student | lecturer | course_advisor | admin |
|---|---|---|---|---|
| `GET /users/me` | ✓ | ✓ | ✓ | ✓ |
| `PATCH /users/me` | ✓ | ✓ | ✓ | ✓ |
| `GET /users/faculty/:id` | ✓ | ✓ | ✓ | ✓ |
| `GET /users/department/:id` | ✓ | ✓ | ✓ | ✓ |
| `GET /users` | — | — | — | ✓ |
| `POST /users` | — | — | — | ✓ |
| `GET /users/:id` | — | — | — | ✓ |
| `PATCH /users/:id` | — | — | — | ✓ |
| `DELETE /users/:id` | — | — | — | ✓ |

### Course Service (`/courses`, `/faculties`, `/departments`)
| Endpoint | student | lecturer | course_advisor | admin | Public |
|---|---|---|---|---|---|
| `GET /courses` | — | — | — | — | ✓ |
| `GET /courses/:id` | — | — | — | — | ✓ |
| `GET /courses/code/:code` | — | — | — | — | ✓ |
| `GET /courses/department/:id` | — | — | — | — | ✓ |
| `POST /courses` | — | ✓ | — | ✓ | — |
| `PATCH /courses/:id` | — | ✓ | — | ✓ | — |
| `DELETE /courses/:id` | — | — | — | ✓ | — |
| `GET /faculties` | — | — | — | — | ✓ |
| `GET /faculties/:id` | — | — | — | — | ✓ |
| `POST /faculties` | — | — | — | ✓ | — |
| `PATCH /faculties/:id` | — | — | — | ✓ | — |
| `DELETE /faculties/:id` | — | — | — | ✓ | — |
| `GET /departments` | — | — | — | — | ✓ |
| `GET /departments/:id` | — | — | — | — | ✓ |
| `POST /departments` | — | — | — | ✓ | — |
| `PATCH /departments/:id` | — | — | — | ✓ | — |
| `DELETE /departments/:id` | — | — | — | ✓ | — |

### Registration Service (`/registrations`)
| Endpoint | student | lecturer | course_advisor | admin |
|---|---|---|---|---|
| `POST /registrations/enroll` | ✓ | — | — | — |
| `POST /registrations/drop` | ✓ | — | — | — |
| `GET /registrations/my` | ✓ | — | — | — |
| `GET /registrations/my/:programId/level/:level/semester/:semester` | ✓ | — | — | — |
| `GET /registrations/course/:courseId` | — | ✓ | ✓ | ✓ |
| `GET /registrations/course/:courseId/count` | — | ✓ | ✓ | ✓ |
| `PATCH /registrations/:id/complete` | — | — | ✓ | ✓ |
| `GET /registrations/:id` | — | — | ✓ | ✓ |

### Curriculum Service (`/programs`, `/curricula`, `/prerequisites`, `/student-curricula`)
| Endpoint | student | lecturer | course_advisor | admin |
|---|---|---|---|---|
| `GET /programs` | ✓ | ✓ | ✓ | ✓ |
| `GET /programs/:id` | ✓ | ✓ | ✓ | ✓ |
| `POST /programs` | — | — | — | ✓ |
| `PATCH /programs/:id` | — | — | — | ✓ |
| `DELETE /programs/:id` | — | — | — | ✓ |
| `GET /curricula/program/:programId` | ✓ | ✓ | ✓ | ✓ |
| `GET /curricula/program/:programId/active` | ✓ | ✓ | ✓ | ✓ |
| `GET /curricula/:id` | ✓ | ✓ | ✓ | ✓ |
| `POST /curricula` | — | — | — | ✓ |
| `PATCH /curricula/:id/activate` | — | — | — | ✓ |
| `PATCH /curricula/:id/deactivate` | — | — | — | ✓ |
| `DELETE /curricula/:id` | — | — | — | ✓ |
| `GET /curricula/:id/courses` | ✓ | ✓ | ✓ | ✓ |
| `POST /curricula/:id/courses` | — | — | — | ✓ |
| `PATCH /curricula/:id/courses/:mappingId` | — | — | — | ✓ |
| `DELETE /curricula/:id/courses/:mappingId` | — | — | — | ✓ |
| `GET /prerequisites/:courseId` | ✓ | ✓ | ✓ | ✓ |
| `GET /prerequisites/:courseId/all` | ✓ | ✓ | ✓ | ✓ |
| `POST /prerequisites` | — | — | — | ✓ |
| `DELETE /prerequisites` | — | — | — | ✓ |
| `POST /student-curricula/assign` | — | — | ✓ | ✓ |
| `POST /student-curricula/migrate` | — | — | ✓ | ✓ |
| `POST /student-curricula/graduation-check` | ✓ | — | ✓ | ✓ |
| `GET /student-curricula/:studentId/:programId` | ✓ | — | ✓ | ✓ |
| `GET /student-curricula/:studentId/:programId/history` | ✓ | — | ✓ | ✓ |

---

## Password Policy

Enforced by Zod at registration:
- Minimum 8 characters
- At least one uppercase letter
- At least one number

Passwords are hashed with bcrypt at 12 salt rounds and are never returned in any API response.

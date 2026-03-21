# Auth Service API

Base path (via gateway): `/auth`
Direct port: `3001`
Rate limit: **20 requests / 15 minutes** per IP (applied at both gateway and service level)

All endpoints are public (no token required).

---

## POST /auth/register

Create a new account.

**Request body**

```json
{
  "email": "student@uni.edu",
  "password": "SecurePass1",
  "role": "student"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Min 8 chars, at least 1 uppercase, at least 1 number |
| `role` | string | No | `student` \| `lecturer` \| `admin` — defaults to `student` |

> Note: `course_advisor` cannot self-register — it must be created by an admin via `POST /users`.

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "student@uni.edu",
    "role": "student"
  }
}
```

Password is never returned. Only `_id`, `email`, and `role` are returned.

**Errors**

| Status | Message |
|---|---|
| 400 | "User already exists" |
| 400 | Zod validation errors (email format, password policy) |
| 429 | "Too many requests, please try again later" |

---

## POST /auth/login

Authenticate and receive JWT tokens.

**Request body**

```json
{
  "email": "student@uni.edu",
  "password": "SecurePass1"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

| Token | Expiry | Use |
|---|---|---|
| `accessToken` | 15 minutes | Include in `Authorization: Bearer <token>` header on every protected request |
| `refreshToken` | 7 days | Reserved for a future token refresh endpoint |

**Errors**

| Status | Message |
|---|---|
| 401 | "Invalid credentials" (wrong email or password — intentionally vague) |
| 429 | "Too many requests, please try again later" |

---

## JWT Payload

The decoded access token contains:

```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "role": "student",
  "iat": 1700000000,
  "exp": 1700000900
}
```

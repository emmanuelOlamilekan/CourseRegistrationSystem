# Environment Variables

Each component has its own `.env` file. Copy `.env.example` to `.env` and fill in the values before starting.

> **Critical**: `JWT_SECRET` must be the same value across all services and the gateway. A mismatch will cause every authenticated request to fail with `401 Invalid token`.

---

## api-gateway

File: `gateway/api-gateway/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3000` | Port the gateway listens on |
| `JWT_SECRET` | Yes | *(see below)* | Must match all services |
| `AUTH_SERVICE_URL` | Yes | `http://auth-service:3001` | Docker service name or IP |
| `USER_SERVICE_URL` | Yes | `http://user-service:3002` | |
| `COURSE_SERVICE_URL` | Yes | `http://course-service:3003` | |
| `REGISTRATION_SERVICE_URL` | Yes | `http://registration-service:3004` | |
| `CURRICULUM_SERVICE_URL` | Yes | `http://curriculum-service:3005` | |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | Comma-separated list |
| `LOG_LEVEL` | No | `info` | Winston log level (debug/info/warn/error) |

---

## auth-service

File: `services/auth-service/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3001` | |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/auth-db` | Isolated database |
| `JWT_SECRET` | Yes | *(see below)* | Must match gateway and all services |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@rabbitmq:5672` | |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | |

---

## user-service

File: `services/user-service/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3002` | |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/user-db` | |
| `JWT_SECRET` | Yes | *(see below)* | |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@rabbitmq:5672` | |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | |

---

## course-service

File: `services/course-service/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3003` | |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/course-db` | |
| `JWT_SECRET` | Yes | *(see below)* | |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@rabbitmq:5672` | |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | |

---

## registration-service

File: `services/registration-service/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3004` | |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/registration-db` | |
| `JWT_SECRET` | Yes | *(see below)* | |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@rabbitmq:5672` | |
| `CURRICULUM_SERVICE_URL` | Yes | `http://curriculum-service:3005` | Used for synchronous enrollment validation |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | |

---

## curriculum-service

File: `services/curriculum-service/.env`

| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | Yes | `3005` | |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/curriculum-db` | |
| `JWT_SECRET` | Yes | *(see below)* | |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@rabbitmq:5672` | |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | |

---

## Generating a Secure JWT_SECRET

```bash
openssl rand -hex 32
```

Use the same output value in every `.env` file that has a `JWT_SECRET` entry.

---

## ALLOWED_ORIGINS Format

Comma-separated list of origins that are permitted by CORS. For local development with a frontend on port 5173:

```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

In production, use only the actual frontend domain(s).

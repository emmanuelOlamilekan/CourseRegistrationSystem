# System Architecture

## Overview

Course Registration System is a Node.js microservices application. All external traffic enters through a single API gateway. Each service owns its own MongoDB database and communicates asynchronously with other services via RabbitMQ.

```
Client
  │
  ▼
┌─────────────────────────────────────────────────┐
│  API Gateway  :3000                             │
│  - JWT verification                             │
│  - Rate limiting (auth: 20/15m, api: 200/15m)  │
│  - Forwards x-user-id, x-user-role headers      │
└──────┬──────┬──────┬─────────────┬─────────────┘
       │      │      │             │
       ▼      ▼      ▼             ▼
   :3001   :3002  :3003         :3004
   auth    user  course      registration
   -db     -db    -db            -db
                                  │ HTTP
                                  ▼
                              :3005
                            curriculum
                               -db

All services → RabbitMQ :5672
```

## Services

| Service | Port | Database | Description |
|---|---|---|---|
| api-gateway | 3000 | — | Reverse proxy, JWT verification, rate limiting |
| auth-service | 3001 | auth-db | Registration, login, JWT issuance |
| user-service | 3002 | user-db | User profiles, roles, department/faculty assignment |
| course-service | 3003 | course-db | Courses, faculties, departments |
| registration-service | 3004 | registration-db | Course enrollment, drops, completions |
| curriculum-service | 3005 | curriculum-db | Programs, curricula, course mappings, prerequisites |

## Communication Patterns

### Synchronous (HTTP)
- **Client → Gateway → Service**: All API calls go through the gateway. The gateway verifies the JWT, injects `x-user-id` and `x-user-role` request headers, then proxies to the target service.
- **registration-service → curriculum-service**: The registration service makes internal HTTP calls to curriculum-service at enrollment time to verify curriculum membership and prerequisites. The target URL is configured via `CURRICULUM_SERVICE_URL`.

### Asynchronous (RabbitMQ)
Services publish events to named queues. All queues are declared as `durable: true` with `persistent: true` messages so they survive broker restarts. See [events.md](./events.md) for the full event catalogue.

## Shared Code (`shared/`)

The `shared/` directory at the repository root is compiled into each service's build. It contains:

```
shared/
├── errors/          AppError, BadRequestError, NotFoundError, etc.
├── middleware/      authMiddleware, validate, errorHandler
├── types/           Express Request augmentation (req.user)
├── logger/          Winston logger configuration
├── messaging/       RabbitMQ singleton (ChannelModel)
└── config/          requireEnv helper
```

Because each service has `rootDir: "../.."` in its `tsconfig.json`, the TypeScript compiler can see files outside `src/`. The compiled output for shared files lands at `dist/shared/` inside each service's build directory. This is why each service's start script is `node dist/services/<name>/src/server.js` (not `node dist/src/server.js`).

## Database Isolation

Each service has its own MongoDB database. No service reads directly from another service's database. Cross-service data needs are satisfied via:
- HTTP calls (registration → curriculum for validation)
- Events (publish/subscribe via RabbitMQ)

The MongoDB instance is shared (single container) but databases are logically separated by name (`auth-db`, `user-db`, `course-db`, `registration-db`, `curriculum-db`).

## Security Layers

1. **Gateway rate limiting** — tight limit on `/auth` (20 req/15min), general limit on all other routes (200 req/15min)
2. **JWT verification at gateway** — invalid tokens are rejected before any service is reached
3. **JWT re-verification at service** — each service independently verifies the token via `shared/middleware/auth.middleware.ts`, providing defence-in-depth
4. **Role-based access** — enforced at the service level; roles are `student`, `lecturer`, `course_advisor`, `admin`
5. **Input validation** — Zod schemas on every mutating endpoint
6. **Helmet** on all services and the gateway
7. **CORS whitelist** — configured via `ALLOWED_ORIGINS` env var on every component

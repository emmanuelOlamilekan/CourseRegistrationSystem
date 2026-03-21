# Local Development

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

---

## Running Everything with Docker Compose

This is the fastest way to get the full system running.

```bash
# 1. Clone the repo and enter the project root
cd CourseRegistrationSystem

# 2. Copy and fill in env files for each component
cp gateway/api-gateway/.env.example          gateway/api-gateway/.env
cp services/auth-service/.env.example        services/auth-service/.env
cp services/user-service/.env.example        services/user-service/.env
cp services/course-service/.env.example      services/course-service/.env
cp services/registration-service/.env.example services/registration-service/.env
cp services/curriculum-service/.env.example  services/curriculum-service/.env

# 3. Generate a single JWT_SECRET and paste it into every .env
openssl rand -hex 32

# 4. Start everything
docker compose up --build
```

Services will be available at:

| Service | URL |
|---|---|
| API Gateway | http://localhost:3000 |
| auth-service (direct) | http://localhost:3001 |
| user-service (direct) | http://localhost:3002 |
| course-service (direct) | http://localhost:3003 |
| registration-service (direct) | http://localhost:3004 |
| curriculum-service (direct) | http://localhost:3005 |
| RabbitMQ Management UI | http://localhost:15672 (guest / guest) |
| MongoDB | localhost:27017 |

All API traffic in production should go through the gateway on `:3000`. Direct service ports are exposed for local debugging only.

---

## Running a Single Service

Useful when iterating on one service without rebuilding everything.

```bash
# Start infrastructure only
docker compose up mongo rabbitmq -d

# Run a service locally
cd services/curriculum-service
npm install
npm run dev
```

The service will connect to MongoDB and RabbitMQ on `localhost`. Make sure the `.env` file uses `localhost` URLs instead of Docker service names:

```
MONGO_URI=mongodb://localhost:27017/curriculum-db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

---

## Building a Service

Each service compiles independently:

```bash
cd services/curriculum-service
npm run build
# Output: dist/services/curriculum-service/src/server.js
```

> The output path includes the full directory from the monorepo root because `tsconfig.json` uses `rootDir: "../.."`. This is required for the shared code to compile correctly. See [shared-code.md](./shared-code.md).

---

## Health Checks

Each service exposes `GET /health`. The gateway's health endpoint also lists all upstream URLs:

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "service": "api-gateway",
  "upstreams": {
    "auth": "http://auth-service:3001",
    "users": "http://user-service:3002",
    "courses": "http://course-service:3003",
    "registrations": "http://registration-service:3004",
    "curriculum": "http://curriculum-service:3005"
  }
}
```

---

## Typical First-Use Flow

```bash
# 1. Register an admin account (adjust JSON as needed)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uni.edu","password":"Admin1234","role":"admin"}'

# 2. Log in to get a token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uni.edu","password":"Admin1234"}'
# → { "accessToken": "...", "refreshToken": "..." }

# 3. Use the token on protected routes
curl http://localhost:3000/programs \
  -H "Authorization: Bearer <accessToken>"
```

---

## Logs

Each service logs to `logs/combined.log` and `logs/error.log` inside its own directory (created on first run). All logs are also written to stdout, which Docker captures.

To tail a service's logs:
```bash
docker compose logs -f curriculum-service
```

---

## Known Gaps (local dev)

- There is no seed script for initial data. An admin user must be created manually via `POST /auth/register`.
- `docker-compose.yml` does not yet define `healthcheck` directives, so services may start before MongoDB is ready. If a service crashes on startup, run `docker compose restart <service-name>`.

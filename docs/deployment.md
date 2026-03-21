# Deployment

## Pre-deployment Checklist

- [ ] All `.env` files have real values (no placeholder strings like `replace-with-...`)
- [ ] `JWT_SECRET` is identical across every service and the gateway
- [ ] `JWT_SECRET` is at least 32 bytes of random data (`openssl rand -hex 32`)
- [ ] `ALLOWED_ORIGINS` lists only the production frontend domain(s)
- [ ] RabbitMQ credentials are changed from the default `guest` / `guest`
- [ ] MongoDB is not publicly accessible (no port 27017 exposed externally)
- [ ] All services are behind the gateway (no direct service ports exposed)

---

## Critical: JWT_SECRET Must Be Shared

Every service re-verifies the JWT independently. If any service has a different `JWT_SECRET` from the one that issued the token, all requests to that service will return `401 Invalid token`.

Set the secret once and distribute it via your secret manager:

```bash
# Generate
openssl rand -hex 32
# → e.g. a3f9c2e1b4d7...

# Set in all .env files or inject via Docker secrets / k8s secrets
JWT_SECRET=a3f9c2e1b4d7...
```

---

## Container Build

Each service and the gateway has its own `Dockerfile` using `node:18-alpine`. The build process is:

1. `npm ci` — install exact versions from `package-lock.json`
2. `npm run build` — compile TypeScript
3. `npm start` — run `node dist/services/<name>/src/server.js`

The gateway uses `node dist/server.js` (its `rootDir` is `src`, not `../..`).

```bash
# Build all images
docker compose build

# Or build a single service
docker compose build curriculum-service
```

---

## docker-compose.yml Notes

The current `docker-compose.yml` is configured for development (ports exposed, no resource limits, default credentials). For production:

### Things to change

1. **Remove direct service port bindings** — only the gateway needs to be publicly accessible:
   ```yaml
   # Remove all of these from non-gateway services:
   ports:
     - "3001:3001"
   ```

2. **Use Docker secrets or environment injection** instead of `.env` files:
   ```yaml
   environment:
     JWT_SECRET: ${JWT_SECRET}
   ```

3. **Change RabbitMQ credentials**:
   ```yaml
   environment:
     RABBITMQ_DEFAULT_USER: your-user
     RABBITMQ_DEFAULT_PASS: your-strong-password
   ```

4. **Add `healthcheck`** so services wait for MongoDB and RabbitMQ to be ready:
   ```yaml
   mongo:
     image: mongo:6
     healthcheck:
       test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok"]
       interval: 10s
       timeout: 5s
       retries: 5
   ```

5. **Add resource limits** to prevent any single service consuming all memory.

---

## Synchronous Service Dependency

The `registration-service` makes HTTP calls to `curriculum-service` at enrollment time. If `curriculum-service` is down, enrollment requests will fail with `503 Service Temporarily Unavailable`.

In production:
- Ensure `curriculum-service` starts before `registration-service` (use `depends_on` with `condition: service_healthy`)
- Consider adding a retry/circuit-breaker in `curriculum.client.ts` for resilience

---

## MongoDB Indexes

MongoDB indexes are created automatically on service startup via Mongoose's schema definitions. This is safe to re-run (Mongoose uses `createIndex` which is idempotent). On large collections the initial index build may be slow — plan a maintenance window for first deployments against existing data.

Key indexes to be aware of:

| Collection | Index | Constraint |
|---|---|---|
| StudentCurriculum | `{ studentId, programId }` where `isActive: true` | Unique (partial filter) |
| CourseMapping | `{ curriculumId, courseId }` | Unique |
| Prerequisite | `{ courseId, requiredCourseId }` | Unique |
| Registration | `{ studentId, courseId, curriculumId }` | Unique |

---

## Scaling

- **Stateless services** (auth, user, course, curriculum): safe to run multiple replicas behind a load balancer. No in-process state.
- **registration-service**: Also stateless, but depends on curriculum-service being reachable. Safe to scale horizontally.
- **api-gateway**: Stateless. Scale horizontally. Put a load balancer in front.
- **MongoDB**: Single instance for now. For production scale, use a replica set.
- **RabbitMQ**: Single instance for now. For production, use a clustered setup with quorum queues.

---

## Logs

All services write structured JSON logs via Winston to:
- `stdout` (captured by Docker)
- `logs/error.log` (error level only)
- `logs/combined.log` (all levels)

In a containerised deployment, rely on stdout and ship logs to a centralised system (e.g. Datadog, Loki, CloudWatch). The `LOG_LEVEL` env var on the gateway controls verbosity.

# Shared Code

The `shared/` directory at the repository root contains utilities that are used by every service. It is not a published npm package — instead it is compiled directly into each service's build via TypeScript's `rootDir` and `include` settings.

---

## Directory Structure

```
shared/
├── errors/
│   ├── AppError.ts          Base error class
│   ├── BadRequestError.ts   400
│   ├── UnauthorizedError.ts 401
│   ├── ForbiddenError.ts    403
│   ├── NotFoundError.ts     404
│   └── index.ts             Barrel re-export
├── middleware/
│   ├── auth.middleware.ts   JWT verification + role guard
│   ├── validate.middleware.ts Zod schema validation
│   └── error.middleware.ts  Express error handler
├── types/
│   └── express.d.ts         Augments Express Request with req.user
├── logger/
│   └── logger.ts            Winston logger
├── messaging/
│   └── rabbitmq.ts          RabbitMQ singleton (ChannelModel)
└── config/
    └── config.ts            requireEnv helper
```

---

## How Services Import Shared Code

Each service imports shared files using relative paths:

```typescript
import { NotFoundError } from "../../../../shared/errors";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware";
```

This works because each service's `tsconfig.json` sets:

```json
{
  "compilerOptions": {
    "rootDir": "../..",
    "outDir": "dist"
  },
  "include": ["src/**/*", "../../shared/**/*"]
}
```

`rootDir: "../.."` points to the monorepo root (`CourseRegistrationSystem/`), so the compiler sees both `services/<name>/src/` and `shared/` as part of the same compilation unit.

### Impact on compiled output

Because `rootDir` is the monorepo root, the compiled output mirrors the full directory structure:

```
services/curriculum-service/dist/
├── services/
│   └── curriculum-service/
│       └── src/
│           └── server.js     ← the entrypoint
└── shared/
    ├── errors/
    │   └── AppError.js
    └── ...
```

This is why each service's start script is:
```
node dist/services/<name>/src/server.js
```
**not** `node dist/src/server.js`.

---

## `shared/errors/`

```typescript
// Usage in any service
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

throw new NotFoundError("Course not found");       // → 404
throw new BadRequestError("Invalid input");        // → 400
```

`AppError` is the base class with `statusCode` and `isOperational` properties. The `errorHandler` middleware in `shared/middleware/error.middleware.ts` checks `isOperational` to decide whether to expose the message to the client.

---

## `shared/middleware/auth.middleware.ts`

```typescript
import { authMiddleware } from "../../../../shared/middleware/auth.middleware";

// Require any valid token
router.get("/me", authMiddleware());

// Require specific roles
router.post("/", authMiddleware(["admin"]));
router.delete("/:id", authMiddleware(["admin", "course_advisor"]));
```

The middleware:
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the JWT using `JWT_SECRET`
3. Attaches `{ userId, role }` to `req.user`
4. Returns `401` if no token or invalid token
5. Returns `403` if the role is not in the allowed list

---

## `shared/types/express.d.ts`

Augments Express's `Request` interface to add `req.user`:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}
export {};
```

The `export {}` is required to make this a module (otherwise the global augmentation has no effect). Every service's `tsconfig.json` includes `../../shared/**/*` so this file is automatically picked up.

---

## Adding New Shared Code

1. Create the file in the appropriate `shared/` subdirectory
2. Export it from the nearest `index.ts` if one exists
3. Import it in services using a relative path from the service root: `../../../../shared/...`
4. No build step needed — the service's own `tsc` compiles it

Do **not** add shared code that depends on service-specific environment variables or models. Shared code must be stateless and generic.

---

## The API Gateway Exception

The `gateway/api-gateway` has `rootDir: "src"` (not `"../.."`) because it does not use any shared code. It has its own inline logger (`src/logger.ts`). If shared code is ever needed in the gateway, change its `tsconfig.json` to `rootDir: "../.."` and update the start script accordingly.

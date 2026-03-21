import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { logger } from "./logger";

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── HTTP request logging ────────────────────────────────────────────────────
app.use(
  morgan("combined", {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
  })
);

// ── Rate limiters ───────────────────────────────────────────────────────────
// Tight limit on auth endpoints to slow brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth requests, please try again later" },
});

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

// ── JWT auth middleware ─────────────────────────────────────────────────────
/**
 * Verifies the JWT and injects decoded user context as request headers
 * that downstream services can trust without re-parsing the token:
 *   x-user-id   — the authenticated user's ID
 *   x-user-role — the user's role (student | lecturer | course_advisor | admin)
 */
interface JwtPayload {
  userId: string;
  role: string;
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    // Forward user context so downstream services don't have to re-decode
    req.headers["x-user-id"] = decoded.userId;
    req.headers["x-user-role"] = decoded.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ── Proxy factory ───────────────────────────────────────────────────────────
function proxy(target: string, pathRewrite?: Record<string, string>) {
  const opts: Options = {
    target,
    changeOrigin: true,
    on: {
      error: (err: Error, _req: IncomingMessage, res: ServerResponse | Socket) => {
        logger.error(`Proxy error to ${target}`, { message: err.message });
        if (res instanceof ServerResponse && !res.headersSent) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "Service temporarily unavailable" })
          );
        }
      },
    },
  };
  if (pathRewrite) opts.pathRewrite = pathRewrite;
  return createProxyMiddleware(opts);
}

// ── Service URLs (with defaults for local dev) ──────────────────────────────
const AUTH_URL         = process.env.AUTH_SERVICE_URL         ?? "http://auth-service:3001";
const USER_URL         = process.env.USER_SERVICE_URL         ?? "http://user-service:3002";
const COURSE_URL       = process.env.COURSE_SERVICE_URL       ?? "http://course-service:3003";
const REGISTRATION_URL = process.env.REGISTRATION_SERVICE_URL ?? "http://registration-service:3004";
const CURRICULUM_URL   = process.env.CURRICULUM_SERVICE_URL   ?? "http://curriculum-service:3005";

// ── Public routes ───────────────────────────────────────────────────────────
// Auth endpoints: no JWT required, tight rate limit
app.use("/auth", authLimiter, proxy(AUTH_URL));

// ── Protected routes ────────────────────────────────────────────────────────
// All routes below require a valid JWT.
// verifyToken injects x-user-id and x-user-role headers before proxying.
app.use(apiLimiter);
app.use(verifyToken);

// User profiles & management  (user-service :3002)
app.use("/users", proxy(USER_URL));

// Course catalogue  (course-service :3003)
app.use("/courses", proxy(COURSE_URL));

// Course registration & enrollment  (registration-service :3004)
app.use("/registrations", proxy(REGISTRATION_URL));

// Curriculum management  (curriculum-service :3005)
app.use("/programs",          proxy(CURRICULUM_URL));
app.use("/curricula",         proxy(CURRICULUM_URL));
app.use("/prerequisites",     proxy(CURRICULUM_URL));
app.use("/student-curricula", proxy(CURRICULUM_URL));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    upstreams: {
      auth:         AUTH_URL,
      users:        USER_URL,
      courses:      COURSE_URL,
      registrations: REGISTRATION_URL,
      curriculum:   CURRICULUM_URL,
    },
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    logger.info("API Gateway shut down");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;

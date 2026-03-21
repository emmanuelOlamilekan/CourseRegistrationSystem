"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const logger_1 = require("./logger");
const app = (0, express_1.default)();
// ── Security headers ────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin))
            callback(null, true);
        else
            callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
// ── HTTP request logging ────────────────────────────────────────────────────
app.use((0, morgan_1.default)("combined", {
    stream: { write: (msg) => logger_1.logger.info(msg.trim()) },
}));
// ── Rate limiters ───────────────────────────────────────────────────────────
// Tight limit on auth endpoints to slow brute-force attacks
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth requests, please try again later" },
});
// General API limit
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
});
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Forward user context so downstream services don't have to re-decode
        req.headers["x-user-id"] = decoded.userId;
        req.headers["x-user-role"] = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
// ── Proxy factory ───────────────────────────────────────────────────────────
function proxy(target, pathRewrite) {
    const opts = {
        target,
        changeOrigin: true,
        on: {
            error: (err, _req, res) => {
                logger_1.logger.error(`Proxy error to ${target}`, { message: err.message });
                if (res instanceof http_1.ServerResponse && !res.headersSent) {
                    res.writeHead(503, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: false, message: "Service temporarily unavailable" }));
                }
            },
        },
    };
    if (pathRewrite)
        opts.pathRewrite = pathRewrite;
    return (0, http_proxy_middleware_1.createProxyMiddleware)(opts);
}
// ── Service URLs (with defaults for local dev) ──────────────────────────────
const AUTH_URL = process.env.AUTH_SERVICE_URL ?? "http://auth-service:3001";
const USER_URL = process.env.USER_SERVICE_URL ?? "http://user-service:3002";
const COURSE_URL = process.env.COURSE_SERVICE_URL ?? "http://course-service:3003";
const REGISTRATION_URL = process.env.REGISTRATION_SERVICE_URL ?? "http://registration-service:3004";
const CURRICULUM_URL = process.env.CURRICULUM_SERVICE_URL ?? "http://curriculum-service:3005";
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
app.use("/programs", proxy(CURRICULUM_URL));
app.use("/curricula", proxy(CURRICULUM_URL));
app.use("/prerequisites", proxy(CURRICULUM_URL));
app.use("/student-curricula", proxy(CURRICULUM_URL));
// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "api-gateway",
        upstreams: {
            auth: AUTH_URL,
            users: USER_URL,
            courses: COURSE_URL,
            registrations: REGISTRATION_URL,
            curriculum: CURRICULUM_URL,
        },
    });
});
// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
    logger_1.logger.info(`API Gateway running on port ${PORT}`);
});
const shutdown = (signal) => {
    logger_1.logger.info(`${signal} received, shutting down`);
    server.close(() => {
        logger_1.logger.info("API Gateway shut down");
        process.exit(0);
    });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
exports.default = app;

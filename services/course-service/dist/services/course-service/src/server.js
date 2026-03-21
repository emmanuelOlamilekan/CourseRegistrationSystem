"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./utils/logger");
const db_1 = require("./config/db");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const faculty_routes_1 = __importDefault(require("./routes/faculty.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin))
            callback(null, true);
        else
            callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(logger_middleware_1.httpLogger);
// Routes
app.use("/faculties", faculty_routes_1.default);
app.use("/departments", department_routes_1.default);
app.use("/courses", course_routes_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "Course service running" });
});
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3003;
let server;
const start = async () => {
    await (0, db_1.connectDB)();
    server = app.listen(PORT, () => {
        logger_1.logger.info(`Course Service running on port ${PORT}`);
    });
};
const shutdown = (signal) => {
    logger_1.logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
        logger_1.logger.info("HTTP server closed");
        process.exit(0);
    });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
start().catch((err) => {
    logger_1.logger.error("Failed to start server", err);
    process.exit(1);
});
exports.default = app;

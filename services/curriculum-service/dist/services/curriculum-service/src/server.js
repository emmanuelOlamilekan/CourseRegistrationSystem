"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_1 = require("./utils/logger");
const program_routes_1 = __importDefault(require("./routes/program.routes"));
const curriculum_routes_1 = __importDefault(require("./routes/curriculum.routes"));
const courseMapping_routes_1 = __importDefault(require("./routes/courseMapping.routes"));
const prerequisite_routes_1 = __importDefault(require("./routes/prerequisite.routes"));
const studentCurriculum_routes_1 = __importDefault(require("./routes/studentCurriculum.routes"));
const app = (0, express_1.default)();
// Security & parsing
app.use((0, helmet_1.default)());
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
app.use(express_1.default.json({ limit: "10kb" }));
app.use(logger_middleware_1.httpLogger);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "curriculum-service" });
});
// Routes
app.use("/programs", program_routes_1.default);
app.use("/curricula", curriculum_routes_1.default);
app.use("/curricula/:curriculumId/courses", (req, _res, next) => {
    // Pass curriculumId into merged params for nested router
    next();
}, courseMapping_routes_1.default);
app.use("/prerequisites", prerequisite_routes_1.default);
app.use("/student-curricula", studentCurriculum_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT ?? 3005;
const start = async () => {
    await (0, db_1.connectDB)();
    const server = app.listen(PORT, () => {
        logger_1.logger.info(`Curriculum service running on port ${PORT}`);
    });
    const shutdown = () => {
        server.close(() => {
            logger_1.logger.info("Curriculum service shut down");
            process.exit(0);
        });
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
};
start();

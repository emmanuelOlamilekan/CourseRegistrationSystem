"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const db_1 = require("./config/db");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS – whitelist specific origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Body parser with size limit
app.use(express_1.default.json({ limit: "10kb" }));
// HTTP request logging
app.use(logger_middleware_1.httpLogger);
// Routes
app.use("/auth", auth_routes_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "Auth service running" });
});
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3001;
let server;
const start = async () => {
    await (0, db_1.connectDB)();
    server = app.listen(PORT, () => {
        logger_1.logger.info(`Auth Service running on port ${PORT}`);
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

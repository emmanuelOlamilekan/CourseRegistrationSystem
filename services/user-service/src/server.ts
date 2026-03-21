import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";
import { connectDB } from "./config/db";
import { httpLogger } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(httpLogger);

app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "User service running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3002;
let server: ReturnType<typeof app.listen>;

const start = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    logger.info(`User Service running on port ${PORT}`);
  });
};

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});

export default app;

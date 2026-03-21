import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/logger.middleware";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS – whitelist specific origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parser with size limit
app.use(express.json({ limit: "10kb" }));

// HTTP request logging
app.use(httpLogger);

// Routes
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "Auth service running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
let server: ReturnType<typeof app.listen>;

const start = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
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

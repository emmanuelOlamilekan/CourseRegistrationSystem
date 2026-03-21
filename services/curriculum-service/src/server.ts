import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./config/db";
import { httpLogger } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";

import programRoutes from "./routes/program.routes";
import curriculumRoutes from "./routes/curriculum.routes";
import courseMappingRoutes from "./routes/courseMapping.routes";
import prerequisiteRoutes from "./routes/prerequisite.routes";
import studentCurriculumRoutes from "./routes/studentCurriculum.routes";

const app = express();

// Security & parsing
app.use(helmet());

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

app.use(express.json({ limit: "10kb" }));
app.use(httpLogger);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "curriculum-service" });
});

// Routes
app.use("/programs", programRoutes);
app.use("/curricula", curriculumRoutes);
app.use(
  "/curricula/:curriculumId/courses",
  (req, _res, next) => {
    // Pass curriculumId into merged params for nested router
    next();
  },
  courseMappingRoutes
);
app.use("/prerequisites", prerequisiteRoutes);
app.use("/student-curricula", studentCurriculumRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT ?? 3005;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    logger.info(`Curriculum service running on port ${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      logger.info("Curriculum service shut down");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

start();

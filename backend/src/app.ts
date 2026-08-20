import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import roomsRoutes from "./routes/rooms.routes";
import { env } from "./config/env";

function createApp(): Application {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/rooms", roomsRoutes);

  return app;
}

export default createApp;
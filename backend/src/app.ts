import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import roomsRoutes from "./routes/rooms.routes";

function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/rooms", roomsRoutes);

  return app;
}

export default createApp;
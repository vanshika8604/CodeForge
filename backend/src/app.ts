import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";

function createApp(): Application {
  const app = express();

  // Middleware: parse incoming JSON request bodies into req.body
  app.use(express.json());

  // Middleware: allow the frontend (different origin) to call this API
  app.use(cors());

  // Mount routes
  app.use("/api", healthRoutes);

  return app;
}

export default createApp;
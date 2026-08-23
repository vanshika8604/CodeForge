
import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: requireEnv("DATABASE_URL"),

  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  judge0ApiUrl: process.env.JUDGE0_API_URL || "",
  judge0ApiKey: process.env.JUDGE0_API_KEY || "",

  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};
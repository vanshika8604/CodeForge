
import dotenv from "dotenv";

dotenv.config();
console.log("GEMINI CONFIG:", {
  hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  model: process.env.GEMINI_MODEL || "NOT_SET",
});

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

  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};
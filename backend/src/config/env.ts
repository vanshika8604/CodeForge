import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";


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
 judge0ApiUrl: requireEnv("JUDGE0_API_URL"),
  judge0ApiKey: process.env.JUDGE0_API_KEY || "",
};
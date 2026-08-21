import rateLimit from "express-rate-limit";
import { RequestHandler } from "express";

const noopRateLimiter: RequestHandler = (_req, _res, next) => {
  next();
};

export const authRateLimiter =
  process.env.NODE_ENV === "test"
    ? noopRateLimiter
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 authentication attempts per 15 minutes
        message: {
          error: "Too many attempts. Please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      });

export const executeRateLimiter =
  process.env.NODE_ENV === "test"
    ? noopRateLimiter
    : rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 15, // 15 code execution requests per minute
        message: {
          error: "Too many execution requests. Please slow down.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
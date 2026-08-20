import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { env } from "../config/env";
import { COOKIE_NAME } from "../utils/cookies";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) {
  const rawCookie = socket.handshake.headers.cookie;

  if (!rawCookie) {
    return next(new Error("AUTH_TOKEN_MISSING"));
  }

  const cookies = parse(rawCookie);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return next(new Error("AUTH_TOKEN_MISSING"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    socket.userId = payload.sub;
    next();
  } catch (error) {
    next(new Error("AUTH_TOKEN_INVALID"));
  }
}
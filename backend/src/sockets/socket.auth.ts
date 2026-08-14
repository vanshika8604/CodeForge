import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth?.token;

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
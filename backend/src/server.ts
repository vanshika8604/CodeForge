import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import createApp from "./app";
import { env } from "./config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./sockets/socket.auth";
import { registerRoomHandlers } from "./sockets/room.socket";
import { createRedisClients } from "./lib/redis";

async function startServer() {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  try {
    const { pubClient, subClient } = await createRedisClients();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis adapter connected — Socket.IO ready to scale across instances");
  } catch (error) {
    console.warn(
      "⚠️  Redis unavailable — running with the default in-memory adapter (single-instance only).",
      error
    );
  }

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user ${socket.userId})`);

    registerRoomHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(env.port, () => {
    console.log(`✅ CodeForge backend running on port ${env.port}`);
    console.log(`🌱 Environment: ${env.nodeEnv}`);
  });
}

startServer();
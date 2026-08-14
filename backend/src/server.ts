import http from "http";
import { Server } from "socket.io";
import createApp from "./app";
import { env } from "./config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./sockets/socket.auth";
import { registerRoomHandlers } from "./sockets/room.socket";

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // tighten this to your frontend's real origin before production
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log(`🔌 Socket connected: ${socket.id} (user ${socket.userId})`);

  registerRoomHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(env.port, () => {
  console.log(`✅ CodeForge backend running on http://localhost:${env.port}`);
  console.log(`🌱 Environment: ${env.nodeEnv}`);
});
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import createApp from "../app";
import { socketAuthMiddleware, AuthenticatedSocket } from "../sockets/socket.auth";
import { registerRoomHandlers } from "../sockets/room.socket";

export interface TestSocketServer {
  httpServer: http.Server;
  io: SocketIOServer;
  port: number;
  close: () => Promise<void>;
}

export async function startTestSocketServer(): Promise<TestSocketServer> {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "http://localhost:3000", credentials: true },
  });

  io.use(socketAuthMiddleware);
  io.on("connection", (socket: AuthenticatedSocket) => {
    registerRoomHandlers(io, socket);
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(0, resolve);
  });

  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : 0;

  return {
    httpServer,
    io,
    port,
    close: () =>
      new Promise((resolve) => {
        io.close();
        httpServer.close(() => resolve());
      }),
  };
}
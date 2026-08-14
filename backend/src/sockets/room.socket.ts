import { Server } from "socket.io";
import prisma from "../lib/prisma";
import { AuthenticatedSocket } from "./socket.auth";

export function registerRoomHandlers(io: Server, socket: AuthenticatedSocket) {
  socket.on("room:join", async (roomId: string, callback) => {
    try {
      const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: socket.userId!, roomId } },
      });

      if (!membership) {
        return callback?.({ ok: false, error: "NOT_A_MEMBER" });
      }

      socket.join(roomId);

      socket.to(roomId).emit("room:user-joined", {
        userId: socket.userId,
      });

      callback?.({ ok: true });
    } catch (error) {
      console.error(error);
      callback?.({ ok: false, error: "INTERNAL_ERROR" });
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("room:user-left", {
          userId: socket.userId,
        });
      }
    }
  });
}
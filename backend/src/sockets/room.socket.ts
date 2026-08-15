import { Server } from "socket.io";
import prisma from "../lib/prisma";
import { AuthenticatedSocket } from "./socket.auth";
import { updateRoomCode } from "../services/rooms.service";

const SAVE_DEBOUNCE_MS = 1500;
const saveTimers = new Map<string, NodeJS.Timeout>();

export function registerRoomHandlers(io: Server, socket: AuthenticatedSocket) {
  socket.on("room:join", async (roomId: string, callback) => {
    try {
      const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: socket.userId!, roomId } },
      });

      if (!membership) {
        return callback?.({ ok: false, error: "NOT_A_MEMBER" });
      }

      const room = await prisma.room.findUnique({ where: { id: roomId } });

      socket.join(roomId);

      socket.to(roomId).emit("room:user-joined", {
        userId: socket.userId,
      });

      callback?.({ ok: true, code: room?.code ?? "", language: room?.language });
    } catch (error) {
      console.error(error);
      callback?.({ ok: false, error: "INTERNAL_ERROR" });
    }
  });

  socket.on("code:change", (data: { roomId: string; content: string }) => {
    const { roomId, content } = data;

    if (!socket.rooms.has(roomId)) {
      return; // ignore changes from sockets that never properly joined this room
    }

    socket.to(roomId).emit("code:update", { content });

    scheduleSave(roomId, content);
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

function scheduleSave(roomId: string, content: string) {
  const existingTimer = saveTimers.get(roomId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    try {
      await updateRoomCode(roomId, content);
    } catch (error) {
      console.error(`Failed to save code for room ${roomId}:`, error);
    } finally {
      saveTimers.delete(roomId);
    }
  }, SAVE_DEBOUNCE_MS);

  saveTimers.set(roomId, timer);
}
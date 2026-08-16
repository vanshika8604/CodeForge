import { Server } from "socket.io";
import prisma from "../lib/prisma";
import { AuthenticatedSocket } from "./socket.auth";
import { updateRoomCode } from "../services/rooms.service";
import { saveChatMessage } from "../services/chat.service";

const SAVE_DEBOUNCE_MS = 1500;
const saveTimers = new Map<string, NodeJS.Timeout>();

export function registerRoomHandlers(io: Server, socket: AuthenticatedSocket) {
  socket.on("room:join", async (roomId: string, callback) => {
    try {
      const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: socket.userId!, roomId } },
        include: { user: { select: { id: true, name: true } } },
      });

      if (!membership) {
        return callback?.({ ok: false, error: "NOT_A_MEMBER" });
      }

      const room = await prisma.room.findUnique({ where: { id: roomId } });

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = socket.userId;
      socket.data.userName = membership.user.name;

      // Snapshot everyone currently connected to this room, deduped by
      // userId (not socket id) — the same user can have multiple sockets
      // open (multiple tabs), and should only ever appear once here.
      const presentSockets = await io.in(roomId).fetchSockets();

      const presentUsersMap = new Map<string, { userId: string; name: string }>();
      for (const s of presentSockets as any[]) {
        if (s.id === socket.id) continue; // exclude this connection itself
        presentUsersMap.set(s.data.userId, {
          userId: s.data.userId,
          name: s.data.userName,
        });
      }
      const presentUsers = Array.from(presentUsersMap.values());

      socket.to(roomId).emit("room:user-joined", {
        userId: socket.userId,
        name: membership.user.name,
      });

      callback?.({
        ok: true,
        code: room?.code ?? "",
        language: room?.language,
        presentUsers,
      });
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

  socket.on(
    "chat:send",
    async (data: { roomId: string; content: string }, callback) => {
      try {
        const { roomId, content } = data;

        if (!socket.rooms.has(roomId)) {
          return callback?.({ ok: false, error: "NOT_IN_ROOM" });
        }

        const trimmed = content.trim();
        if (!trimmed) {
          return callback?.({ ok: false, error: "EMPTY_MESSAGE" });
        }

        const message = await saveChatMessage(roomId, socket.userId!, trimmed);

        io.in(roomId).emit("chat:message", {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
        });

        callback?.({ ok: true });
      } catch (error) {
        console.error(error);
        callback?.({ ok: false, error: "INTERNAL_ERROR" });
      }
    }
  );

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
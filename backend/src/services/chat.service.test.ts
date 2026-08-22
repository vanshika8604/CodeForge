import prisma from "../lib/prisma";
import { saveChatMessage, getRecentMessages } from "./chat.service";

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as any;

describe("chat.service", () => {
  describe("saveChatMessage", () => {
    it("creates a message including the sender's public info", async () => {
      mockedPrisma.chatMessage.create.mockResolvedValue({
        id: "msg-1",
        content: "hello room",
        sender: { id: "user-1", name: "Ada Lovelace" },
      });

      const message = await saveChatMessage("room-1", "user-1", "hello room");

      expect(mockedPrisma.chatMessage.create).toHaveBeenCalledWith({
        data: { roomId: "room-1", senderId: "user-1", content: "hello room" },
        include: { sender: { select: { id: true, name: true } } },
      });
      expect(message.sender.name).toBe("Ada Lovelace");
    });
  });

  describe("getRecentMessages", () => {
    it("returns messages in oldest-to-newest order", async () => {
      // Prisma returns them newest-first (desc); the service must reverse them.
      mockedPrisma.chatMessage.findMany.mockResolvedValue([
        { id: "msg-3", content: "third", createdAt: new Date("2026-01-01T00:00:03Z") },
        { id: "msg-2", content: "second", createdAt: new Date("2026-01-01T00:00:02Z") },
        { id: "msg-1", content: "first", createdAt: new Date("2026-01-01T00:00:01Z") },
      ]);

      const messages = await getRecentMessages("room-1");

      expect(messages.map((m) => m.id)).toEqual(["msg-1", "msg-2", "msg-3"]);
    });

    it("queries with orderBy desc and the given limit", async () => {
      mockedPrisma.chatMessage.findMany.mockResolvedValue([]);

      await getRecentMessages("room-1", 20);

      expect(mockedPrisma.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roomId: "room-1" },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      );
    });
  });
});
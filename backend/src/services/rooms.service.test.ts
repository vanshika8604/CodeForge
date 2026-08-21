import prisma from "../lib/prisma";
import { createRoom, joinRoom, getRoomById } from "./rooms.service";

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    room: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    roomMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as any;

describe("rooms.service", () => {
  describe("createRoom", () => {
    it("regenerates the join code on collision before creating the room", async () => {
      // First check finds a collision, second check is clear.
      mockedPrisma.room.findUnique
        .mockResolvedValueOnce({ id: "existing-room", joinCode: "AAAAAA" })
        .mockResolvedValueOnce(null);

      mockedPrisma.room.create.mockResolvedValue({
        id: "room-1",
        name: "DSA Practice",
        joinCode: "BBBBBB",
        members: [{ userId: "owner-1", role: "owner" }],
      });

const room = await createRoom({
  name: "DSA Practice",
  code: "console.log('Hello World');",
  ownerId: "owner-1",
});
      expect(mockedPrisma.room.findUnique).toHaveBeenCalledTimes(2);
      expect(room.id).toBe("room-1");
    });
  });

  describe("joinRoom", () => {
    it("throws ROOM_NOT_FOUND for an unknown join code", async () => {
      mockedPrisma.room.findUnique.mockResolvedValue(null);

      await expect(joinRoom("BADCODE", "user-1")).rejects.toThrow("ROOM_NOT_FOUND");
    });

    it("is a no-op (does not create a duplicate membership) if already a member", async () => {
      mockedPrisma.room.findUnique.mockResolvedValue({ id: "room-1", joinCode: "AAAAAA" });
      mockedPrisma.roomMember.findUnique.mockResolvedValue({
        userId: "user-1",
        roomId: "room-1",
      });

      const room = await joinRoom("AAAAAA", "user-1");

      expect(mockedPrisma.roomMember.create).not.toHaveBeenCalled();
      expect(room.id).toBe("room-1");
    });
  });

  describe("getRoomById", () => {
    it("throws NOT_A_MEMBER when the requesting user is not in the room's members", async () => {
      mockedPrisma.room.findUnique.mockResolvedValue({
        id: "room-1",
        members: [{ userId: "owner-1" }],
      });

      await expect(getRoomById("room-1", "some-other-user")).rejects.toThrow("NOT_A_MEMBER");
    });

    it("returns the room when the requesting user IS a member", async () => {
      mockedPrisma.room.findUnique.mockResolvedValue({
        id: "room-1",
        members: [{ userId: "owner-1" }, { userId: "member-2" }],
      });

      const room = await getRoomById("room-1", "member-2");

      expect(room.id).toBe("room-1");
    });
  });
});
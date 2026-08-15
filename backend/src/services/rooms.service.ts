import prisma from "../lib/prisma";
import { generateJoinCode } from "../utils/generateJoinCode";

interface CreateRoomInput {
  name: string;
  language?: string;
  ownerId: string;
}

export async function createRoom(input: CreateRoomInput) {
  let joinCode = generateJoinCode();

  // Extremely unlikely collision, but guard against it rather than assume.
  let existing = await prisma.room.findUnique({ where: { joinCode } });
  while (existing) {
    joinCode = generateJoinCode();
    existing = await prisma.room.findUnique({ where: { joinCode } });
  }

  const room = await prisma.room.create({
    data: {
      name: input.name,
      language: input.language || "javascript",
      joinCode,
      ownerId: input.ownerId,
      members: {
        create: {
          userId: input.ownerId,
          role: "owner",
        },
      },
    },
    include: { members: true },
  });

  return room;
}

export async function joinRoom(joinCode: string, userId: string) {
  const room = await prisma.room.findUnique({ where: { joinCode } });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const existingMembership = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId, roomId: room.id } },
  });

  if (existingMembership) {
    return room; // already a member — joining again is a no-op, not an error
  }

  await prisma.roomMember.create({
    data: { userId, roomId: room.id, role: "collaborator" },
  });

  return room;
}

export async function getRoomById(roomId: string, userId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const isMember = room.members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new Error("NOT_A_MEMBER");
  }

  return room;
}

export async function listMyRooms(userId: string) {
  const memberships = await prisma.roomMember.findMany({
    where: { userId },
    include: { room: true },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => m.room);
}

export async function updateRoomCode(roomId: string, code: string) {
  await prisma.room.update({
    where: { id: roomId },
    data: { code },
  });
}
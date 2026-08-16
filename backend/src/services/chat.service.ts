import prisma from "../lib/prisma";

export async function saveChatMessage(roomId: string, senderId: string, content: string) {
  const message = await prisma.chatMessage.create({
    data: { roomId, senderId, content },
    include: { sender: { select: { id: true, name: true } } },
  });

  return message;
}

export async function getRecentMessages(roomId: string, limit = 50) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages.reverse();
}
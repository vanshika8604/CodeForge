import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createRoom, joinRoom, getRoomById, listMyRooms } from "../services/rooms.service";
import { getRecentMessages } from "../services/chat.service";


export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, language, code } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const room = await createRoom({
      name,
      language,
      code: code || "",
      ownerId: req.userId!,
    });

    return res.status(201).json({ room });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function join(req: AuthenticatedRequest, res: Response) {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ error: "joinCode is required" });
    }

    const room = await joinRoom(joinCode, req.userId!);
    return res.status(200).json({ room });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getOne(req: AuthenticatedRequest, res: Response) {
  try {
    const room = await getRoomById(req.params.id, req.userId!);
    return res.status(200).json({ room });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({ error: "Room not found" });
    }
    if (error instanceof Error && error.message === "NOT_A_MEMBER") {
      return res.status(403).json({ error: "You are not a member of this room" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function listMine(req: AuthenticatedRequest, res: Response) {
  try {
    const rooms = await listMyRooms(req.userId!);
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  try {
    await getRoomById(req.params.id, req.userId!); // reuses membership check
    const messages = await getRecentMessages(req.params.id);
    return res.status(200).json({ messages });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({ error: "Room not found" });
    }
    if (error instanceof Error && error.message === "NOT_A_MEMBER") {
      return res.status(403).json({ error: "You are not a member of this room" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
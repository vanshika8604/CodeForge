import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getRoomById } from "../services/rooms.service";
import { reviewCode } from "../services/openai.service";

export async function review(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const roomId = req.params.id;

    const room = await getRoomById(roomId, req.userId!);

    const result = await reviewCode(room.language, room.code);

    return res.status(200).json({ result });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    if (error instanceof Error && error.message === "NOT_A_MEMBER") {
      return res.status(403).json({
        error: "You are not a member of this room",
      });
    }

    if (
      error instanceof Error &&
      error.message === "OPENAI_API_KEY_MISSING"
    ) {
      return res.status(503).json({
        error: "AI review service is not configured",
      });
    }

    if (
      error instanceof Error &&
      (
        error.message === "EMPTY_AI_RESPONSE" ||
        error.message === "INVALID_AI_RESPONSE"
      )
    ) {
      return res.status(502).json({
        error: "AI review service returned an unexpected response",
      });
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 429
    ) {
      return res.status(503).json({
        error:
          "AI review is currently unavailable because the AI API quota has been exhausted.",
      });
    }
    
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong",
    });
  }
}
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { executeCode } from "../services/judge0.service";
import { getRoomById } from "../services/rooms.service";

export async function execute(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const roomId = req.params.id;

    const room = await getRoomById(
      roomId,
      req.userId!
    );

    const { stdin } = req.body;

    const result = await executeCode(
      room.language,
      room.code,
      stdin || ""
    );

    return res.status(200).json({ result });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ROOM_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "NOT_A_MEMBER"
    ) {
      return res.status(403).json({
        error: "You are not a member of this room",
      });
    }

    if (
      error instanceof Error &&
      error.message === "JUDGE0_NOT_CONFIGURED"
    ) {
      return res.status(503).json({
        error: "Code execution service is not configured",
      });
    }

    if (
      error instanceof Error &&
      error.message === "UNSUPPORTED_LANGUAGE"
    ) {
      return res.status(400).json({
        error: "This language is not supported for execution",
      });
    }

    if (
      error instanceof Error &&
      error.message === "EXECUTION_TIMEOUT"
    ) {
      return res.status(504).json({
        error: "Code execution timed out",
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Something went wrong",
    });
  }
}

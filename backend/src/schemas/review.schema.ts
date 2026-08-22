import { z } from "zod";

export const reviewRequestSchema = z.object({
  // Currently no body fields are required — the room's own code/language are
  // used, matching the same server-authoritative pattern as execution.
  // Defined as an empty schema now so a future addition (e.g., focusing the
  // review on a specific function) has a clear, typed place to go.
});
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { create, join, getOne, listMine, getMessages } from "../controllers/rooms.controller";
import { execute } from "../controllers/execution.controller";
import { executeRateLimiter } from "../middleware/rateLimit.middleware";


const router = Router();

router.use(requireAuth); // every route below requires a logged-in user

router.post("/", create);
router.post("/join", join);
router.get("/", listMine);
router.get("/:id/messages", getMessages);
router.get("/:id", getOne);
router.post("/:id/execute", executeRateLimiter, execute);

export default router;
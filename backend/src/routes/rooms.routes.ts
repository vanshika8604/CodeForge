import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { create, join, getOne, listMine } from "../controllers/rooms.controller";

const router = Router();

router.use(requireAuth); // every route below requires a logged-in user

router.post("/", create);
router.post("/join", join);
router.get("/", listMine);
router.get("/:id", getOne);

export default router;
import express from "express";
import { listRooms, getRoom } from "../controllers/room.controller.js";

const router = express.Router();

router.get("/", listRooms);
router.get("/:roomName", getRoom);

export default router;

import express from "express";
import { getStatus, getHealth } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/status", getStatus);
router.get("/health", getHealth);

export default router;

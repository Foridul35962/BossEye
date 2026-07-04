import express from "express";
import { getPower } from "../controllers/power.controller.js";

const router = express.Router();

router.get("/", getPower);

export default router;

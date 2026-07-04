import express from "express";
import { listAlerts } from "../controllers/alert.controller.js";

const router = express.Router();

router.get("/", listAlerts);

export default router;

import express from "express";
import { listDevices, getDevice, patchDevice } from "../controllers/device.controller.js";

const router = express.Router();

router.get("/", listDevices);
router.get("/:id", getDevice);
router.patch("/:id", patchDevice);

export default router;

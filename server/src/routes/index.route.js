import express from "express";
import deviceRoutes from "./device.routes.js";
import roomRoutes from "./room.routes.js";
import powerRoutes from "./power.routes.js";
import alertRoutes from "./alert.routes.js";
import statusRoutes from "./status.routes.js";

const router = express.Router();

router.use("/devices", deviceRoutes);
router.use("/rooms", roomRoutes);
router.use("/power", powerRoutes);
router.use("/alerts", alertRoutes);
router.use("/", statusRoutes);

export default router;

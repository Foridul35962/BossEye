import * as deviceService from "../services/device.service.js";
import * as powerService from "../services/power.service.js";
import * as alertService from "../services/alert.service.js";
import redisClient from "../config/redis.js";
import { ROOMS, CACHE_TTL_SECONDS } from "../utils/constants.js";


export async function getStatus(req, res, next) {
  try {
    const cached = await redisClient.get("cache:status");
    if (cached) return res.json(JSON.parse(cached));

    const devices = await deviceService.getAllDevices();
    const power = await powerService.getCurrentPower();
    const estimatedUsageTodayKWh = await powerService.getEstimatedUsageToday();
    const alerts = await alertService.getActiveAlerts();

    const rooms = ROOMS.map((room) => {
      const roomDevices = devices.filter((d) => d.room === room);
      return {
        room,
        fans: { on: roomDevices.filter((d) => d.type === "fan" && d.status).length, total: roomDevices.filter((d) => d.type === "fan").length },
        lights: { on: roomDevices.filter((d) => d.type === "light" && d.status).length, total: roomDevices.filter((d) => d.type === "light").length },
        powerWatts: power.perRoom[room] || 0,
      };
    });

    const payload = {
      rooms,
      totalPower: power.totalPower,
      estimatedUsageTodayKWh,
      activeAlerts: alerts.length,
      timestamp: new Date().toISOString(),
    };

    await redisClient.set("cache:status", JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export function getHealth(req, res) {
  res.json({ status: "OK" });
}

import * as powerService from "../services/power.service.js";
import redisClient from "../config/redis.js";
import { CACHE_TTL_SECONDS } from "../utils/constants.js";

export async function getPower(req, res, next) {
  try {
    const cached = await redisClient.get("cache:power");
    if (cached) return res.json(JSON.parse(cached));

    const current = await powerService.getCurrentPower();
    const estimatedUsageTodayKWh = await powerService.getEstimatedUsageToday();
    const payload = { ...current, estimatedUsageTodayKWh };

    await redisClient.set("cache:power", JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

import Redis from "ioredis";
import dotenv from 'dotenv'
dotenv.config()

const redisUrl = process.env.REDIS_URL;
const prefix = process.env.REDIS_PREFIX || "bossEye";

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL is not set");
}

const redis = new Redis(redisUrl, {
  keyPrefix: `${prefix}:`,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 1000, 5000);
  },
});

redis.on("connect", () => {
  console.log("✅ [bossEye] Redis connected");
});

redis.on("ready", () => {
  console.log("🚀 [bossEye] Redis ready at http://localhost:5540");
});

redis.on("error", (err) => {
  console.error("❌ [bossEye] Redis error:", err);
});

redis.on("close", () => {
  console.warn("⚠️ [bossEye] Redis connection closed");
});


export const startServer = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis connection failed:", err.message);
  }
};

export default redis;
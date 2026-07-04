import Device from "../model/Devices.model.js";
import redisClient from "../config/redis.js";
import { CACHE_TTL_SECONDS } from "../utils/constants.js";

export async function getAllDevices() {
  return Device.find().sort({ room: 1, type: 1, name: 1 });
}

export async function getDeviceById(id) {
  return Device.findById(id);
}

export async function getDevicesByRoom(roomName) {
  return Device.find({ room: roomName }).sort({ type: 1, name: 1 });
}

export async function setDeviceStatus(id, status) {
  const device = await Device.findById(id);
  if (!device) return null;

  const wasOn = device.status;
  device.status = status;
  device.lastChanged = new Date();

  if (status && !wasOn) {
    device.runningSince = new Date();
  } else if (!status) {
    device.runningSince = null;
  }

  await device.save();

  await invalidateAggregateCache();

  return device;
}

export async function invalidateAggregateCache() {
  await redisClient.del("cache:power", "cache:status", "cache:devices", "cache:rooms");
}

export { CACHE_TTL_SECONDS };

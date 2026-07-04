import Device from "../model/Devices.model.js";
import PowerHistory from "../model/PowerHistory.model.js";
import { ROOMS } from "../utils/constants.js";

export async function getCurrentPower() {
  const devices = await Device.find({ status: true }, "watt room");

  const perRoom = {};
  ROOMS.forEach((r) => (perRoom[r] = 0));

  let total = 0;
  devices.forEach((d) => {
    total += d.watt;
    perRoom[d.room] = (perRoom[d.room] || 0) + d.watt;
  });

  return { totalPower: total, perRoom };
}

export async function getEstimatedUsageToday() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const snapshots = await PowerHistory.find({ time: { $gte: startOfDay } }).sort({
    time: 1,
  });

  if (snapshots.length === 0) return 0;

  let kWh = 0;
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    const hours = (curr.time - prev.time) / (1000 * 60 * 60);
    const avgWatts = (prev.totalPower + curr.totalPower) / 2;
    kWh += (avgWatts * hours) / 1000;
  }

  return Math.round(kWh * 100) / 100;
}

export async function recordSnapshot() {
  const { totalPower, perRoom } = await getCurrentPower();
  await PowerHistory.create({ time: new Date(), totalPower, perRoom });
  return { totalPower, perRoom };
}

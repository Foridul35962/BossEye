import Alerts from "../model/Alert.model.js";
import Devices from "../model/Devices.model.js";
import { ROOMS, OFFICE_HOURS, LONG_RUNNING_THRESHOLD_MS } from "../utils/constants.js";

export async function getActiveAlerts() {
  return Alerts.find({ resolved: false }).sort({ createdAt: -1 }).limit(50);
}

export function isAfterHoursNow() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Dhaka",
    }).format(new Date())
  );

  return hour < OFFICE_HOURS.start || hour >= OFFICE_HOURS.end;
}

export async function checkAlerts({ onNewAlert } = {}) {
  const devices = await Devices.find();
  const newAlerts = [];
  const now = Date.now();

  if (isAfterHoursNow()) {
    const onDevices = devices.filter((d) => d.status);
    for (const d of onDevices) {
      const existing = await Alerts.findOne({
        type: "AFTER_HOURS",
        device: d._id,
        resolved: false,
      });
      if (!existing) {
        const alert = await Alerts.create({
          type: "AFTER_HOURS",
          room: d.room,
          device: d._id,
          message: `${d.name} in ${d.room} is still ON after office hours.`,
        });
        newAlerts.push(alert);
        if (onNewAlert) onNewAlert(alert);
      }
    }
    // Resolve after-hours alerts for devices that got turned off.
    await Alerts.updateMany(
      { type: "AFTER_HOURS", resolved: false, device: { $nin: onDevices.map((d) => d._id) } },
      { resolved: true }
    );
  } else {
    // Back within office hours -> clear any lingering after-hours alerts.
    await Alerts.updateMany({ type: "AFTER_HOURS", resolved: false }, { resolved: true });
  }

  for (const room of ROOMS) {
    const roomDevices = devices.filter((d) => d.room === room);
    const allOnLongEnough =
      roomDevices.length > 0 &&
      roomDevices.every(
        (d) => d.status && d.runningSince && now - new Date(d.runningSince).getTime() > LONG_RUNNING_THRESHOLD_MS
      );

    const existing = await Alerts.findOne({ type: "LONG_RUNNING_ROOM", room, resolved: false });

    if (allOnLongEnough && !existing) {
      const alert = await Alerts.create({
        type: "LONG_RUNNING_ROOM",
        room,
        message: `${room} has had every device running continuously for over 2 hours.`,
      });
      newAlerts.push(alert);
      if (onNewAlert) onNewAlert(alert);
    } else if (!allOnLongEnough && existing) {
      existing.resolved = true;
      await existing.save();
    }
  }

  return newAlerts;
}

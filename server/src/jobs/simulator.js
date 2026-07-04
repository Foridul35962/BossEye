import Device from "../model/Devices.model.js";
import * as deviceService from "../services/device.service.js";
import * as powerService from "../services/power.service.js";
import * as alertService from "../services/alert.service.js";
import * as socketService from "../services/socket.service.js";

const SIMULATOR_INTERVAL_MS = 30 * 1000;

function startSimulator() {
  setInterval(async () => {
    try {
      const count = await Device.countDocuments();
      if (count === 0) return;

      const randomSkip = Math.floor(Math.random() * count);
      const device = await Device.findOne().skip(randomSkip);
      if (!device) return;

      const updated = await deviceService.setDeviceStatus(device._id, !device.status);
      socketService.emitDeviceUpdated(updated);

      const power = await powerService.getCurrentPower();
      socketService.emitPowerUpdated(power);

      await alertService.checkAlerts({
        onNewAlert: (alert) => socketService.emitAlertCreated(alert),
      });
    } catch (err) {
      console.error("[simulator] tick failed:", err.message);
    }
  }, SIMULATOR_INTERVAL_MS);

  console.log(`[simulator] running, flipping a random device every ${SIMULATOR_INTERVAL_MS / 1000}s.`);
}

export default startSimulator;

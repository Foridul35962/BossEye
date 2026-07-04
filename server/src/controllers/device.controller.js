import * as deviceService from "../services/device.service.js";
import * as powerService from "../services/power.service.js";
import * as alertService from "../services/alert.service.js";
import * as socketService from "../services/socket.service.js";

export async function listDevices(req, res, next) {
  try {
    const devices = await deviceService.getAllDevices();
    res.json(devices);
  } catch (err) {
    next(err);
  }
}

export async function getDevice(req, res, next) {
  try {
    const device = await deviceService.getDeviceById(req.params.id);
    if (!device) return res.status(404).json({ error: "Device not found" });
    res.json(device);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/devices/:id  { status: boolean }
 *
 * Flow (matches the plan): update device -> recalc power -> check alerts ->
 * emit socket events. This is the single control path the dashboard's
 * ON/OFF toggle and (in principle) the Discord bot both go through.
 */
export async function patchDevice(req, res, next) {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return res.status(400).json({ error: "Body must include boolean 'status'" });
    }

    const device = await deviceService.setDeviceStatus(req.params.id, status);
    if (!device) return res.status(404).json({ error: "Device not found" });

    socketService.emitDeviceUpdated(device);

    const power = await powerService.getCurrentPower();
    socketService.emitPowerUpdated(power);

    const newAlerts = await alertService.checkAlerts({
      onNewAlert: (alert) => socketService.emitAlertCreated(alert),
    });

    res.json({ device, power, newAlerts });
  } catch (err) {
    next(err);
  }
}

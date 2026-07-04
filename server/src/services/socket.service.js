let ioInstance = null;

export function init(io) {
  ioInstance = io;
}

export function emitDeviceUpdated(device) {
  if (ioInstance) ioInstance.emit("deviceUpdated", device);
}

export function emitPowerUpdated(power) {
  if (ioInstance) ioInstance.emit("powerUpdated", power);
}

export function emitAlertCreated(alert) {
  if (ioInstance) ioInstance.emit("alertCreated", alert);
}

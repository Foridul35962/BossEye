import * as deviceService from "../services/device.service.js";
import { ROOMS, resolveRoomName } from "../utils/constants.js";

export async function listRooms(req, res, next) {
  try {
    const devices = await deviceService.getAllDevices();
    const rooms = ROOMS.map((room) => {
      const roomDevices = devices.filter((d) => d.room === room);
      return {
        room,
        deviceCount: roomDevices.length,
        onCount: roomDevices.filter((d) => d.status).length,
      };
    });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

export async function getRoom(req, res, next) {
  try {
    const resolved = resolveRoomName(req.params.roomName);
    if (!resolved) {
      return res.status(404).json({
        error: `Unknown room '${req.params.roomName}'`,
        validRooms: ROOMS,
        validSlugs: ["drawing", "work1", "work2"],
      });
    }
    const devices = await deviceService.getDevicesByRoom(resolved);
    res.json({ room: resolved, devices });
  } catch (err) {
    next(err);
  }
}

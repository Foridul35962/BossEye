import { io, Socket } from "socket.io-client";
import type { Device, PowerData, AlertItem } from "./types";

interface ServerToClientEvents {
  deviceUpdated: (device: Device) => void;
  powerUpdated: (power: PowerData) => void;
  alertCreated: (alert: AlertItem) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClientToServerEvents {}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      autoConnect: true,
      reconnectionDelay: 1500,
    });
  }
  return socket;
}

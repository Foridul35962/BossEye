export type DeviceType = "fan" | "light";

export interface Device {
  _id: string;
  name: string;
  room: string;
  type: DeviceType;
  watt: number;
  status: boolean;
  lastChanged: string;
  runningSince: string | null;
}

export interface PowerData {
  totalPower: number;
  perRoom: Record<string, number>;
  estimatedUsageTodayKWh?: number;
}

export type AlertType = "AFTER_HOURS" | "LONG_RUNNING_ROOM";

export interface AlertItem {
  _id: string;
  type: AlertType;
  message: string;
  room: string;
  device: string | null;
  resolved: boolean;
  createdAt: string;
}

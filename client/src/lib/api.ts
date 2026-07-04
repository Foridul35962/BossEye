import type { Device, PowerData, AlertItem } from "./types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getDevices: () => request<Device[]>("/api/devices"),
  getPower: () => request<PowerData>("/api/power"),
  getAlerts: () => request<AlertItem[]>("/api/alerts"),
  toggleDevice: async (id: string, status: boolean) => {
    const res = await fetch(`${BASE}/api/devices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`PATCH device ${id} failed: ${res.status}`);
    return res.json() as Promise<{ device: Device; power: PowerData; newAlerts: AlertItem[] }>;
  },
};

"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import type { Device, PowerData, AlertItem } from "../lib/types";
import DeviceStatusPanel from "../components/DeviceStatusPanel";
import PowerMeter from "../components/PowerMeter";
import AlertsPanel from "../components/AlertsPanel";
import OfficeLayout from "../components/OfficeLayout";

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [power, setPower] = useState<PowerData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Initial load over REST.
  useEffect(() => {
    (async () => {
      try {
        const [devicesRes, powerRes, alertsRes] = await Promise.all([
          api.getDevices(),
          api.getPower(),
          api.getAlerts(),
        ]);
        setDevices(devicesRes);
        setPower(powerRes);
        setAlerts(alertsRes);
      } catch (err) {
        console.error("Initial fetch failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live updates over Socket.IO — no polling, no manual refresh needed.
  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("deviceUpdated", (updated: Device) => {
      setDevices((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    });

    socket.on("powerUpdated", (updatedPower: PowerData) => {
      setPower((prev) => (prev ? { ...prev, ...updatedPower } : updatedPower));
    });

    socket.on("alertCreated", (alert: AlertItem) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("deviceUpdated");
      socket.off("powerUpdated");
      socket.off("alertCreated");
    };
  }, []);

  const handleToggle = useCallback(async (id: string, status: boolean) => {
    // Optimistic UI update; the socket broadcast will reconcile shortly after.
    setDevices((prev) => prev.map((d) => (d._id === id ? { ...d, status } : d)));
    try {
      await api.toggleDevice(id, status);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading office dashboard...</div>;
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Smart Office Dashboard</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            connected ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
          }`}
        >
          {connected ? "● Live" : "● Disconnected"}
        </span>
      </header>

      <OfficeLayout devices={devices} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerMeter power={power} />
        <AlertsPanel alerts={alerts} />
      </div>

      <DeviceStatusPanel devices={devices} onToggle={handleToggle} />
    </main>
  );
}

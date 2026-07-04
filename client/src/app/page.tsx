"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import type { Device, PowerData, AlertItem } from "../lib/types";
import DeviceStatusPanel from "../components/DeviceStatusPanel";
import PowerMeter from "../components/PowerMeter";
import AlertsPanel from "../components/AlertsPanel";
import OfficeLayout from "../components/OfficeLayout";
import { Radio, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [power, setPower] = useState<PowerData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

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
    setDevices((prev) => prev.map((d) => (d._id === id ? { ...d, status } : d)));
    try {
      await api.toggleDevice(id, status);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#0b0f19] to-[#020617] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-widest uppercase text-center">Initializing Core...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-tr from-[#0b0f19] via-[#0f172a] to-[#1e1b4b]/30 text-slate-100 p-4 sm:p-6 md:p-8 w-full max-w-none space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* 🛠️ Responsive Header / Navbar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white shrink-0">
            <LayoutDashboard className="w-5 h-5 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent wrap-break-word">
              BOSS EYE ARCHITECTURE
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-indigo-400/80 tracking-widest uppercase mt-0.5">HQ Automation & Telemetry</p>
          </div>
        </div>
        
        {/* Connection Status Badge */}
        <div className="flex sm:justify-end">
          <span
            className={`flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black tracking-widest px-3 sm:px-4 py-2 rounded-xl border-2 shadow-inner transition-all duration-500 w-full sm:w-auto ${
              connected 
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                : "bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${connected ? "animate-pulse" : ""}`} />
            {connected ? "SYSTEM LIVE" : "LINK SEVERED"}
          </span>
        </div>
      </header>

      {/* 🛠️ Grid Layout - Mobile to Desktop Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Layout Floor Plan */}
        <div className="xl:col-span-12 w-full overflow-hidden">
          <OfficeLayout devices={devices} />
        </div>

        {/* Analytics Section Split */}
        <div className="xl:col-span-6 w-full">
          <PowerMeter power={power} />
        </div>
        <div className="xl:col-span-6 w-full">
          <AlertsPanel alerts={alerts} />
        </div>

        {/* Live Control Panel */}
        <div className="xl:col-span-12 w-full">
          <DeviceStatusPanel devices={devices} onToggle={handleToggle} />
        </div>
      </div>
    </main>
  );
}
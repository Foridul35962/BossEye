"use client";

import type { PowerData } from "../lib/types";
import { Zap, AppWindow } from "lucide-react";

interface PowerMeterProps {
  power: PowerData | null;
}

export default function PowerMeter({ power }: PowerMeterProps) {
  if (!power) return null;
  const { totalPower, perRoom, estimatedUsageTodayKWh } = power;

  return (
    <div className="bg-[#131b2e]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide">Grid Load Telemetry</h2>
          </div>
          
          {typeof estimatedUsageTodayKWh === "number" && (
            <span className="flex items-center gap-1.5 text-xs font-black font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl shadow-md">
              <AppWindow className="w-3.5 h-3.5" />
              {estimatedUsageTodayKWh} KWH TODAY
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-6 bg-[#090d16] p-4 rounded-xl border border-slate-900">
          <span className="text-6xl font-black tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-mono">
            {totalPower}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">WATT SYSTEM LOAD</span>
        </div>
      </div>

      <div className="space-y-4">
        {perRoom &&
          Object.entries(perRoom).map(([room, watts]) => (
            <div key={room} className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
              <span className="w-32 text-xs font-extrabold text-slate-400 truncate uppercase tracking-widest">{room}</span>
              <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  style={{ width: `${Math.min(100, (watts / (totalPower || 1)) * 100)}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs font-mono font-black text-slate-300">{watts} W</span>
            </div>
          ))}
      </div>
    </div>
  );
}
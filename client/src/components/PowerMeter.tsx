"use client";

import type { PowerData } from "../lib/types";

interface PowerMeterProps {
  power: PowerData | null;
}

export default function PowerMeter({ power }: PowerMeterProps) {
  if (!power) return null;
  const { totalPower, perRoom, estimatedUsageTodayKWh } = power;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-3">Power Consumption</h2>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-emerald-400">{totalPower}</span>
        <span className="text-gray-400">W total</span>
        {typeof estimatedUsageTodayKWh === "number" && (
          <span className="text-xs text-gray-500 ml-auto">
            ~{estimatedUsageTodayKWh} kWh today
          </span>
        )}
      </div>
      <div className="space-y-2">
        {perRoom &&
          Object.entries(perRoom).map(([room, watts]) => (
            <div key={room} className="flex items-center gap-2 text-sm">
              <span className="w-28 text-gray-400 truncate">{room}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (watts / (totalPower || 1)) * 100)}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-300">{watts}W</span>
            </div>
          ))}
      </div>
    </div>
  );
}

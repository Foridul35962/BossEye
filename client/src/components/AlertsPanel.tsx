"use client";

import type { AlertItem } from "../lib/types";

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-3">Active Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500">No active alerts. Everything looks normal.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a._id}
              className="text-sm bg-amber-500/10 border border-amber-600/40 rounded-lg px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-amber-300">⚠️ {a.message}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import type { Device } from "../lib/types";

const ROOM_ORDER = ["Drawing Room", "Work Room 1", "Work Room 2"];

interface DeviceStatusPanelProps {
  devices: Device[];
  onToggle: (id: string, status: boolean) => void;
}

export default function DeviceStatusPanel({ devices, onToggle }: DeviceStatusPanelProps) {
  const byRoom = ROOM_ORDER.map((room) => ({
    room,
    devices: devices.filter((d) => d.room === room),
  }));

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-3">Live Device Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byRoom.map(({ room, devices: roomDevices }) => (
          <div key={room} className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{room}</h3>
            <ul className="space-y-2">
              {roomDevices.map((d) => (
                <li key={d._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        d.status ? "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" : "bg-gray-600"
                      }`}
                    />
                    <span>{d.name}</span>
                    <span className="text-gray-500 text-xs">{d.watt}W</span>
                  </div>
                  <button
                    onClick={() => onToggle(d._id, !d.status)}
                    className={`text-xs px-2 py-1 rounded-md border ${
                      d.status
                        ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-gray-600 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {d.status ? "ON" : "OFF"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

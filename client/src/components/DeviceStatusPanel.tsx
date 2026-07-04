"use client";

import type { Device } from "../lib/types";
import { Cpu, Power, ToggleLeft } from "lucide-react";

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
    <div className="bg-[#131b2e]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-200 tracking-wide">Mainframe Switch Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {byRoom.map(({ room, devices: roomDevices }) => (
          <div key={room} className="bg-[#090d16] rounded-xl p-5 border border-slate-900 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-indigo-400/80 tracking-widest uppercase mb-4 pb-2 border-b border-slate-800">
                {room}
              </h3>
              <ul className="space-y-3">
                {roomDevices.map((d) => (
                  <li key={d._id} className="flex items-center justify-between bg-[#111827]/80 p-3 rounded-xl border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-500 ${
                          d.status 
                            ? "bg-emerald-400 shadow-[0_0_12px_4px_rgba(52,211,153,0.5)]" 
                            : "bg-slate-700"
                        }`}
                      />
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-200 truncate">{d.name}</p>
                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider block mt-0.5 uppercase">
                          CONSUMPTION: {d.watt}W
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggle(d._id, !d.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-xs font-mono tracking-wider transition-all duration-300 shadow-md ${
                        d.status
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "border-slate-700 text-slate-400 bg-slate-900 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {d.status ? "ON" : "OFF"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import type { Device, DeviceType } from "../lib/types";
import { Compass } from "lucide-react";

const ROOMS = [
  { name: "Drawing Room", x: 20 },
  { name: "Work Room 1", x: 280 },
  { name: "Work Room 2", x: 540 },
];
const ROOM_WIDTH = 240;
const ROOM_HEIGHT = 220;

interface OfficeLayoutProps {
  devices: Device[];
}

export default function OfficeLayout({ devices }: OfficeLayoutProps) {
  const byRoom = (room: string, type: DeviceType) =>
    devices.filter((d) => d.room === room && d.type === type);

  return (
    <div className="bg-[#131b2e]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-200 tracking-wide">Interactive Cyber Floor Plan</h2>
      </div>

      {/* 🛠️ Mobile and Touch Device Responsive Wrapper */}
      <div className="bg-[#090d16] rounded-xl p-4 border border-slate-900 shadow-inner overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <svg 
          viewBox="0 0 800 260" 
          className="w-full min-w-190 h-auto block"
        >
          {ROOMS.map(({ name, x }) => {
            const fans = byRoom(name, "fan");
            const lights = byRoom(name, "light");
            return (
              <g key={name}>
                {/* Tech Outlines */}
                <rect
                  x={x}
                  y={10}
                  width={ROOM_WIDTH}
                  height={ROOM_HEIGHT}
                  rx={16}
                  fill="#0e1322"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <rect
                  x={x + 4}
                  y={14}
                  width={ROOM_WIDTH - 8}
                  height={ROOM_HEIGHT - 8}
                  rx={12}
                  fill="none"
                  stroke="#334155/30"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={x + 18} y={36} fill="#64748b" fontSize="11" fontWeight="800" letterSpacing="0.1em">
                  {name.toUpperCase()}
                </text>

                {/* Lights - Cyber Cyan Theme */}
                {lights.map((l, i) => {
                  const cx = x + 45 + i * 75;
                  const cy = 75;
                  return (
                    <g key={l._id}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={14}
                        fill={l.status ? "url(#cyanGlow)" : "#1e293b"}
                        stroke={l.status ? "#06b6d4" : "#475569"}
                        strokeWidth="2.5"
                        style={{ filter: l.status ? "drop-shadow(0px 0px 12px rgba(6, 182, 212, 0.6))" : "none" }}
                      />
                      <text x={cx} y={cy + 30} fill="#475569" fontSize="9" fontWeight="750" textAnchor="middle">
                        {l.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Fans - Cyber Emerald Theme */}
                {fans.map((f, i) => {
                  const cx = x + 65 + i * 110;
                  const cy = 160;
                  return (
                    <g key={f._id}>
                      <g transform={`translate(${cx},${cy})`}>
                        {f.status && (
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0"
                            to="360"
                            dur="1.2s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                        )}
                        <circle r={18} fill="#0f172a" stroke={f.status ? "#10b981" : "#334155"} strokeWidth="2.5"
                          style={{ filter: f.status ? "drop-shadow(0px 0px 12px rgba(16, 185, 129, 0.5))" : "none" }}
                        />
                        {[0, 90, 180, 270].map((deg) => (
                          <line
                            key={deg}
                            x1="0"
                            y1="0"
                            x2={18 * Math.cos((deg * Math.PI) / 180)}
                            y2={18 * Math.sin((deg * Math.PI) / 180)}
                            stroke={f.status ? "#34d399" : "#475569"}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        ))}
                      </g>
                      <text x={cx} y={cy + 32} fill="#475569" fontSize="9" fontWeight="750" textAnchor="middle">
                        {f.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Gradients Defs */}
          <defs>
            <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#cffafe" />
              <stop offset="100%" stopColor="#22d3ee" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}